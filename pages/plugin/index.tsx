//import s from './index.module.scss';
//import cn from 'classnames';
import withGlobalProps from '/lib/withGlobalProps';
import { GetStaticProps } from 'next';

export type Props = {
	region: Region;
};

export default function PluginPage({}: Props) {
	return <div>plugin</div>;
}

export const getStaticProps: GetStaticProps = withGlobalProps(
	{ queries: [] },
	async ({ props, revalidate, context }: any) => {
		return {
			props: {
				...props,
			},
			revalidate,
		};
	},
);
