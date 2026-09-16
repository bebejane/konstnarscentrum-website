import * as dotenv from 'dotenv'
dotenv.config({ path: "./.env" });

import { buildClient } from '@datocms/cma-client'
import { execFileSync } from 'child_process'
import fs from 'fs'

const environment = process.env.DATOCMS_ENVIRONMENT!;
const client = buildClient({
	apiToken: process.env.GRAPHQL_API_TOKEN_FULL as string,
	environment,
});

const OUTPUT_FILE = `${process.cwd()}/guess-member-sex.json`;
const args = process.argv.slice(2);
const flag = (name: string, fallback?: string) => {
	const i = args.indexOf(name);
	return i > -1 ? args[i + 1] : fallback;
};
const skip = parseInt(flag('--skip', '0')) || 0;
const limit = parseInt(flag('--limit', String(Infinity))) || Infinity;
const model = flag('--model', 'opencode/big-pickle');
const run = (cmd, arg) => {
	try {
		const out = execFileSync(cmd, arg, {
			encoding: 'utf-8',
			maxBuffer: 64 * 1024 * 1024,
			timeout: 120000,
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		return out;
	} catch (err: any) {
		console.error(`opencode failed: ${err.message}`);
		return '';
	}
};
const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, '').trim();
const guessSex = (firstName: string, lastName: string): string => {
	const prompt = `Based on the Swedish first name "${firstName}" and last name "${lastName}", guess the likely sex of this person. Respond with exactly ONE word, either "male" or "female". Nothing else.`;
	const out = stripAnsi(run('opencode', ['run', '--agent', 'plan', '-m', model, prompt]));
	const m = out.match(/male|female/i);
	return m ? m[0].toLowerCase() : 'unknown';
};

async function main() {
	console.log(`Loading all members (env: ${environment})...`);
	const members = [];
	for await (const record of client.items.listPagedIterator({ filter: { type: 'member' }, page: { limit: 100 } })) {
		if (record.first_name && record.last_name) members.push(record);
	}
	console.log(`Loaded ${members.length} members with first & last name`);

	const results = [];
	const slice = members.slice(skip, skip + limit);
	for (let i = 0; i < slice.length; i++) {
		const member = slice[i];
		const firstName = `${member.first_name}`;
		const lastName = `${member.last_name}`;
		const sex = guessSex(firstName, lastName);
		const row = {
			id: member.id,
			firstName,
			lastName,
			fullName: member.full_name || `${firstName} ${lastName}`,
			email: member.email,
			sex,
		};
		results.push(row);
		console.log(`[${skip + i + 1}/${members.length}] ${row.fullName} → ${sex}`);
		fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
	}

	const counted = results.reduce((acc, r) => {
		acc[r.sex] = (acc[r.sex] || 0) + 1;
		return acc;
	}, {});
	console.log(`\nDone. ${results.length} guessed. ${JSON.stringify(counted)}`);
	console.log(`Written to ${OUTPUT_FILE}`);
	process.exit(0);
}

main();