import {
  CloudSyncOutlined,
  FileProtectOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { Card, Flex, Typography } from "antd";
import type { ReactNode } from "react";
import {
  authBlob,
  authBlobA,
  authBlobB,
  authBlobC,
  authCard,
  authCardBrand,
  authHero,
  authHeroArt,
  authHeroBody,
  authHeroBrand,
  authHeroCopy,
  authHeroIcon,
  authHeroItem,
  authHeroList,
  authHeroTitle,
  authMain,
  authMark,
  authPage,
  authSubtitle,
  authTitle,
  authWordmark,
} from "../../styles/layout/public.layout.css";

const { Title, Paragraph, Text } = Typography;

const features = [
  { icon: <ShopOutlined />, text: "Every branch on one ledger" },
  { icon: <FileProtectOutlined />, text: "Vouchers with an approval trail" },
  { icon: <CloudSyncOutlined />, text: "Works offline, syncs when you return" },
];

type IProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

const AuthShell = ({ title, subtitle, children }: IProps) => {
  return (
    <Flex className={`${authPage}`}>
      <Flex vertical component="aside" className={`${authHero}`}>
        <Flex className={`${authHeroBrand}`} align="center" gap={12}>
          <Flex
            component="span"
            className={`${authMark}`}
            align="center"
            justify="center"
            aria-hidden="true"
          >
            T
          </Flex>
          TARTAR
        </Flex>

        <Flex vertical className={`${authHeroBody}`}>
          <Title level={1} className={`${authHeroTitle}`}>
            The calm ledger behind a busy tartar.
          </Title>
          <Paragraph className={`${authHeroCopy}`}>
            Cash, receivables, payables and vouchers for every branch — kept in
            one quiet, careful place.
          </Paragraph>
          <Flex vertical component="ul" className={`${authHeroList}`}>
            {features.map((feature) => (
              <Flex
                key={feature.text}
                component="li"
                className={`${authHeroItem}`}
                align="center"
                gap={12}
              >
                <Flex
                  component="span"
                  className={`${authHeroIcon}`}
                  align="center"
                  justify="center"
                  aria-hidden="true"
                >
                  {feature.icon}
                </Flex>
                {feature.text}
              </Flex>
            ))}
          </Flex>
        </Flex>

        <div className={`${authHeroArt}`} aria-hidden="true" />
      </Flex>

      <Flex component="main" className={`${authMain}`}>
        <span className={`${authBlob} ${authBlobA}`} aria-hidden="true" />
        <span className={`${authBlob} ${authBlobB}`} aria-hidden="true" />
        <span className={`${authBlob} ${authBlobC}`} aria-hidden="true" />

        <Card className={`${authCard}`} variant="borderless">
          <Flex className={`${authCardBrand}`} align="center" gap={10}>
            <Flex
              component="span"
              className={`${authMark}`}
              align="center"
              justify="center"
              aria-hidden="true"
            >
              T
            </Flex>
            <span className={`${authWordmark}`}>TARTAR</span>
          </Flex>

          <Title level={2} className={`${authTitle}`}>
            {title}
          </Title>
          <Text className={`${authSubtitle}`}>{subtitle}</Text>

          {children}
        </Card>
      </Flex>
    </Flex>
  );
};

export default AuthShell;
