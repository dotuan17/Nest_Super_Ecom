import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';
import { he } from 'zod/v4/locales';

interface PlaidVerifyIdentityEmailProps {
  code: string;
  title: string;
}

const baseUrl = "https://plus.unsplash.com/premium_vector-1689096818551-edb79a6fa3da?q=80&w=1180&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"

export const OTPEmail = ({
  code,
  title,
}: PlaidVerifyIdentityEmailProps) => (
  <Html>
    <Head>
      <title>{title}</title>
    </Head>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={baseUrl}
          width="212"
          height="88"
          alt="Plaid"
          style={logo}
        />
        <Text style={tertiary}>Verify Your Identity</Text>
        <Heading style={secondary}>
          Hãy nhập mã xác thực sau để tiếp tục đăng nhập vào tài khoản của bạn.
        </Heading>
        <Section style={codeContainer}>
          <Text style={codeCss}>{code}</Text>
        </Section>
        <Text style={paragraph}>Not expecting this email?</Text>
        <Text style={paragraph}>
          Contact{' '}
          <Link href="mailto:login@plaid.com" style={link}>
            login@plaid.com
          </Link>{' '}
          if you did not request this code.
        </Text>
      </Container>
      <Text style={footer}>Securely powered by Ecommerce Nest DVT.</Text>
    </Body>
  </Html>
);

OTPEmail.PreviewProps = {
  code: '144833',
  title: 'Verify Your Identity',
} as PlaidVerifyIdentityEmailProps;

export default OTPEmail;
const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #eee',
  borderRadius: '5px',
  boxShadow: '0 5px 10px rgba(20,50,70,.2)',
  marginTop: '20px',
  maxWidth: '360px',
  margin: '0 auto',
  padding: '68px 0 130px',
};

const logo = {
  margin: '0 auto',
  width: '70px',
  height: '70px',
  borderRadius: '100%',
};

const tertiary = {
  color: '#0a85ea',
  fontSize: '11px',
  fontWeight: 700,
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  height: '16px',
  letterSpacing: '0',
  lineHeight: '16px',
  margin: '16px 8px 8px 8px',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
};

const secondary = {
  color: '#000',
  display: 'inline-block',
  fontFamily: 'HelveticaNeue-Medium,Helvetica,Arial,sans-serif',
  fontSize: '20px',
  fontWeight: 500,
  lineHeight: '24px',
  marginBottom: '0',
  marginTop: '0',
  textAlign: 'center' as const,
};

const codeContainer = {
  background: 'rgba(0,0,0,.05)',
  borderRadius: '4px',
  margin: '16px auto 14px',
  verticalAlign: 'middle',
  width: '280px',
};

const codeCss = {
  color: '#000',
  display: 'inline-block',
  fontFamily: 'HelveticaNeue-Bold',
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '6px',
  lineHeight: '40px',
  paddingBottom: '8px',
  paddingTop: '8px',
  margin: '0 auto',
  width: '100%',
  textAlign: 'center' as const,
};

const paragraph = {
  color: '#444',
  fontSize: '15px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  letterSpacing: '0',
  lineHeight: '23px',
  padding: '0 40px',
  margin: '0',
  textAlign: 'center' as const,
};

const link = {
  color: '#444',
  textDecoration: 'underline',
};

const footer = {
  color: '#000',
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '0',
  lineHeight: '23px',
  margin: '0',
  marginTop: '20px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
};
