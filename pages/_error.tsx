import Link from 'next/link';
import s from './_error.module.scss';
import { RegionLink } from '/components';

function Error({ statusCode }) {
	return (
		<p className={s.container}>
			{statusCode ? `Det gick ej att hitta sidan` : `Det uppstode ett fel på klienten`}
			<br />
			<br />
			<a href='/'>Tillbaka hem</a>
		</p>
	);
}

Error.getInitialProps = ({ res, err }) => {
	const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
	return { statusCode };
};

export default Error;
