import React, { ReactElement } from 'react';
import { MjmlHead, MjmlFont, MjmlAttributes, MjmlAll, MjmlStyle, MjmlRaw } from 'mjml-react';
import { black, grayDark, grayLight } from './theme';

type HeadProps = { children?: ReactElement };

const Head: React.FC<HeadProps> = ({ children }) => {
	return (
		<MjmlHead>
			<>
				<MjmlRaw>
					<meta name='color-scheme' content='light dark' />
					<meta name='supported-color-schemes' content='light dark' />
				</MjmlRaw>
				<MjmlFont name='Jazz' href={`${process.env.NEXT_PUBLIC_SITE_URL}/fonts/email.css`} />
				<MjmlStyle>{`
        strong {
          font-weight: 700;
          font-style: bold;
        }
        .smooth {
          -webkit-font-smoothing: antialiased;
        }
        .paragraph a {
          color: ${black} !important;
        }

        .paragraph span {
          color: ${grayDark} !important;
        }

        .li {
          text-indent: -18px;
          margin-left: 24px;
          display: inline-block;
        }
        .footer a {
          text-decoration: none !important;
          color: ${grayDark} !important;
        }
        .dark-mode {
          display: none;
        }
        @media (min-width:480px) {
          td.hero {
            padding-left: 24px !important;
            padding-right: 24px !important;
          }
        }
        @media (prefers-color-scheme: dark) {
          body {
            background: ${black};
          }
          .logo > * {
            filter: invert(1) !important;
          }
          .paragraph > *, .paragraph a, .li > div {
            color: #fff !important;
          }
          .dark-mode {
            display: inherit;
          }
          .light-mode {
            display: none;
          }
        }
      `}</MjmlStyle>
				<MjmlAttributes>
					<MjmlAll
						font-family='"Jazz", Univers, "Univers", Helvetica, Arial, -apple-system, BlinkMacSystemFont, 
            sans-serif'
						font-weight='400'
					/>
				</MjmlAttributes>
				{children}
			</>
		</MjmlHead>
	);
};

export default Head;
