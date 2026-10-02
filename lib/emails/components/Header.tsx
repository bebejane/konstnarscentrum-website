import { MjmlSection, MjmlColumn, MjmlImage } from 'mjml-react';

type HeaderProps = {
	loose?: boolean;
};

const Header: React.FC<HeaderProps> = ({ loose }) => {
	return (
		<MjmlSection padding={loose ? '40px 0 40px' : '20px 0 24px'}>
			<MjmlColumn>
				<MjmlImage
					padding='0 20% 0'
					align='center'
					src={`${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`}
					cssClass='logo'
				/>
			</MjmlColumn>
		</MjmlSection>
	);
};

export default Header;
