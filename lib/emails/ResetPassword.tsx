import { ReactElement } from 'react';
import Head from './components/Head';
import Header from './components/Header';
import Footer from './components/Footer';
import Line from './components/Line';
import ButtonPrimary from './components/ButtonPrimary';
import { leadingRelaxed, textBase } from './components/theme';

import { Mjml, MjmlBody, MjmlSection, MjmlColumn, MjmlText, MjmlSpacer } from 'mjml-react';

type ResetPasswordProps = {
	link: string;
	body: ReactElement;
	ctaText: string;
};

const ResetPassword: React.FC<ResetPasswordProps> = ({ link, body, ctaText }) => {
	return (
		<Mjml>
			<Head />
			<MjmlBody width={600}>
				<Header loose />
				<MjmlSection padding='0 24px' cssClass='smooth'>
					<MjmlColumn>
						<Line padding='0 0 32px 0'></Line>
						<MjmlText
							cssClass='paragraph'
							padding='0'
							fontSize={textBase}
							lineHeight={leadingRelaxed}
						>
							Hej, <br />
							<br />
							Vi har mottagit din begäran om att byta lösenord
							<br />
							<br />
							Använd länken nedan för att ställa in ett nytt lösenord till ditt konto.
						</MjmlText>
						<MjmlSpacer height='24px' />
						<ButtonPrimary link={link} uiText='Återställ lösenord' />
						<MjmlSpacer height='8px' />
						<MjmlText
							padding='16px 0'
							fontSize={textBase}
							lineHeight={leadingRelaxed}
							cssClass='paragraph'
						>
							Tänk på att länken bara går att använda en gång. Om du behöver kan du återuppta
							lösenords-processen igen{' '}
							<a href={`${process.env.NEXT_PUBLIC_SITE_URL}/konstnar/konto/aterstall-losenord`}>
								här.
							</a>
						</MjmlText>
						<MjmlText
							padding='0'
							fontSize={textBase}
							lineHeight={leadingRelaxed}
							cssClass='paragraph'
						>
							Med vänliga hälsningar,
							<br />
							Konstnärscentrum
						</MjmlText>
						<Line padding='16px 0 0'></Line>
					</MjmlColumn>
				</MjmlSection>
				<Footer />
			</MjmlBody>
		</Mjml>
	);
};

export default ResetPassword;
