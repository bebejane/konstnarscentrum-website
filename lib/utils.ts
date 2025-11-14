import { TypedDocumentNode } from '@apollo/client/core';
import { apiQuery } from 'dato-nextjs-utils/api';
import { regions } from '/lib/region';
import { isAfter, isBefore } from 'date-fns';
import * as EmailValidator from 'email-validator';
import { NextApiRequest, NextApiResponse } from 'next';
import type { ApiQueryOptions } from 'dato-nextjs-utils/api';
import React from 'react';

export const isServer = typeof window === 'undefined';

export const breakpoints = {
	mobile: 320,
	tablet: 740,
	desktop: 980,
	wide: 1441,
	navBreak: 1368,
};

export const pageSize = 10;

export const chunkArray = (array: any[] | React.ReactNode[], chunkSize: number) => {
	const newArr = [];
	for (let i = 0; i < array.length; i += chunkSize) newArr.push(array.slice(i, i + chunkSize));
	return newArr;
};

export const parseDatoError = (err: any) => {
	const apiError = err.response?.body?.data;
	if (!apiError) return err?.message ?? err;

	const error = {
		_error: apiError,
		message: apiError.map(({ attributes: { details } }) => {
			const { messages } = details;
			const m = !messages ? undefined : (!Array.isArray(messages) ? [messages] : messages).join('. ');
			const d = (!Array.isArray(details) ? [details] : details)?.map(
				({ field_label, field_type, code, extraneous_attributes }) =>
					extraneous_attributes
						? `Error fields: ${extraneous_attributes.join(', ')}`
						: `${field_label} (${field_type}): ${code}`
			);
			return `${m ?? ''} ${d ?? ''}`;
		}),
		codes: apiError.map(({ attributes: { code } }) => code),
	};
	return error;
};

export const catchErrorsFrom = (handler) => {
	return async (req: NextApiRequest, res: NextApiResponse) => {
		return handler(req, res).catch((error) => {
			let err = parseDatoError(error);
			err =
				typeof err === 'string'
					? err
					: {
							...err,
							_originalError: typeof error === 'string' ? error : { ...error },
					  };
			res.status(500).send(err);
			console.log(JSON.stringify(err, null, 2));
		});
	};
};

export const pingEndpoint = async (path: string | string[], method: 'GET' | 'POST' = 'POST') => {
	path = !Array.isArray(path) ? [path] : path;
	path.forEach((p) =>
		fetch(p, { method, body: JSON.stringify({ ping: true }) })
			.then(() => console.log(`pinged ${path} endpoint`))
			.catch((err) => console.error(`Failed: ping ${path} endpoint`, err))
	);
};

export const recordToSlug = (record: any, region?: Region): string => {
	let url;

	if (!record) {
		throw new Error('recordToSlug: Record  is empty');
	}

	if (typeof record === 'string') return record;
	else {
		const { __typename, slug } = record;

		switch (__typename) {
			case 'CommissionRecord':
				url = `/anlita-oss/uppdrag/${slug}`;
				break;
			case 'MemberRecord':
				url = `/anlita-oss/hitta-konstnar/${slug}`;
				break;
			case 'NewsRecord':
				url = `/nyheter/${slug}`;
				break;
			case 'MemberNewsRecord':
				url = `/konstnar/aktuellt/${slug}`;
				break;
			case 'AboutRecord':
				url = `/om/${slug}`;
				break;
			default:
				throw Error(`${__typename} is unknown record slug!`);
		}
	}

	return region && !region?.global ? `/${region.slug}/${url}` : url;
};

export const isEmail = (email: string): boolean => {
	return EmailValidator.validate(email);
};

export const fetchAllRecords = async (query: TypedDocumentNode, type?: string) => {
	const posts = [];

	for (let page = 0, count; posts.length < count || page === 0; page++) {
		const res = await apiQuery(query, { variables: { first: 100, skip: page * 100 } });
		const key = type || Object.keys(res).find((k) => k !== 'pagination');
		posts.push.apply(posts, res[key]);
		count = res.pagination.count;
	}

	return posts;
};

export const getStaticPaginationPaths = async (
	query: TypedDocumentNode,
	segment: string,
	regional: boolean = false
) => {
	const paths = [];
	const items = await fetchAllRecords(query);

	if (regional) {
		regions.forEach((region) => {
			const pages = chunkArray(
				items.filter((p) => p.region.id === region.id),
				pageSize
			);
			pages.forEach((posts, pageNo) => {
				paths.push.apply(
					paths,
					posts.map((p) => ({
						params: {
							region: region.slug,
							[segment]: p.slug,
							page: `${pageNo + 1}`,
						},
					}))
				);
			});
		});
	} else {
		const pages = chunkArray(items, pageSize);
		pages.forEach((posts, pageNo) => {
			paths.push.apply(
				paths,
				posts.map((p) => ({
					params: {
						[segment]: p.slug,
						page: `${pageNo + 1}`,
					},
				}))
			);
		});
	}

	return {
		paths,
		fallback: 'blocking',
	};
};

export const getStaticPagePaths = async (query: TypedDocumentNode, segment: string, regional: boolean = false) => {
	const items = await fetchAllRecords(query);
	const paths = [];

	items.forEach(({ slug, region }) => {
		const params = { [segment]: slug };
		paths.push(!regional ? { params } : { params: { ...params, region: region?.slug } });
	});

	return {
		paths,
		fallback: 'blocking',
	};
};

export const truncateParagraph = (
	s: string,
	sentances: number = 1,
	ellipsis: boolean = true,
	minLength = 200
): string => {
	if (!s || s.length < minLength) return s;

	let dotIndex = s
		.split('.')
		?.slice(0, sentances + 1)
		.join('.')
		.lastIndexOf('.');
	let qIndex = s
		.split('? ')
		?.slice(0, sentances + 1)
		.join('? ')
		.lastIndexOf('? ');
	const isQuestion = (qIndex !== -1 && qIndex < dotIndex) || (dotIndex === -1 && qIndex > -1);

	if (dotIndex === -1 && qIndex === -1) {
		dotIndex = minLength - 1;
		ellipsis = true;
	}

	let str = s.substring(0, isQuestion ? qIndex : dotIndex); //`${s.substring(0, minLength - 1)}${s.substring(minLength - 1).split('.').slice(0, sentances).join('. ')}`
	return `${str}${ellipsis ? '...' : isQuestion ? '?' : '.'}`;
};

export const isEmptyObject = (obj: any) => Object.keys(obj).filter((k) => obj[k] !== undefined).length === 0;

export const capitalize = (str: string, lower: boolean = false) => {
	return (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase());
};

export const sleep = (ms: number) => new Promise((resolve, refject) => setTimeout(resolve, ms));

export const apiQueryAll = async (doc: TypedDocumentNode, opt: ApiQueryOptions = {}): Promise<any> => {
	const results = {};
	let size = 100;
	let skip = 0;
	const res = await apiQuery(doc, { variables: { ...opt.variables, first: size, skip } });

	if (res.pagination?.count === undefined) throw new Error('Not a pagable query');

	const { count } = res.pagination;

	const mergeProps = (res) => {
		const props = Object.keys(res);

		for (let i = 0; i < props.length; i++) {
			const k = props[i];
			const el = res[props[i]];
			if (Array.isArray(el)) {
				results[k] = !results[k] ? el : results[k].concat(el);
			} else results[k] = el;
		}
	};

	const isRejected = (input: PromiseSettledResult<unknown>): input is PromiseRejectedResult =>
		input.status === 'rejected';

	const isFulfilled = <T>(input: PromiseSettledResult<T>): input is PromiseFulfilledResult<T> =>
		input.status === 'fulfilled';

	mergeProps(res);

	let reqs = [];
	for (let skip = size; skip < count; skip += size) {
		if (reqs.length < 50 && skip + size < count) {
			reqs.push(apiQuery(doc, { variables: { ...opt.variables, first: size, skip } }));
		} else {
			reqs.push(apiQuery(doc, { variables: { ...opt.variables, first: size, skip } }));
			const data = await Promise.allSettled(reqs);
			const error = data.find(isRejected)?.reason;
			if (error) throw new Error(error);

			for (let x = 0; x < data.length; x++) mergeProps(data[x].value);
			await sleep(100);
			reqs = [];
		}
	}
	return results;
};

export const memberNewsStatus = (date, dateEnd): { value: string; label: string; order: number } => {
	const today = new Date();
	const start = new Date(date);
	const end = !dateEnd ? start : new Date(dateEnd);
	const status = isAfter(today, end)
		? { value: 'past', label: 'Avslutat', order: -1 }
		: isBefore(today, start)
		? { value: 'upcoming', label: 'Kommande', order: 0 }
		: { value: 'present', label: 'Nu', order: 1 };
	return status;
};

export const randomInt = (min, max) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
