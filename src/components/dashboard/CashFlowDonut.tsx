import { Pie } from "@ant-design/charts";
import { Empty, Flex } from "antd";
import { colors } from "../../styles/common/vars.css";
import { chartLoading } from "../../styles/view/common/common.view.css";
import {
  donutCenter,
  donutCenterLabel,
  donutCenterValue,
  donutLegend,
  donutLegendDot,
  donutLegendKey,
  donutLegendRow,
  donutLegendValue,
  donutWrap,
} from "../../styles/view/dashboard/dashboard.view.css";
import { formatMoney } from "../../utils/format.utils";

type IProps = {
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
};

const CashFlowDonut = ({ cashIn, cashOut, netCashFlow }: IProps) => {
  const hasMovement = cashIn > 0 || cashOut > 0;

  const legend = [
    { label: "Cash In", value: cashIn, color: colors.positive },
    { label: "Cash Out", value: cashOut, color: colors.danger },
    { label: "Net Cash Flow", value: netCashFlow, color: colors.brand },
  ];

  return (
    <>
      <Flex className={`${donutWrap}`} vertical>
        {hasMovement ? (
          <>
            <Pie
              data={[
                { type: "Cash In", value: cashIn },
                { type: "Cash Out", value: cashOut },
              ]}
              angleField="value"
              colorField="type"
              innerRadius={0.7}
              height={220}
              legend={false}
              label={false}
              scale={{ color: { range: [colors.positive, colors.danger] } }}
              tooltip={{
                items: [
                  {
                    channel: "y",
                    valueFormatter: (value: number) => formatMoney(value),
                  },
                ],
              }}
            />
            <Flex
              className={`${donutCenter}`}
              vertical
              align="center"
              justify="center"
            >
              <span className={`${donutCenterValue}`}>
                {formatMoney(netCashFlow)}
              </span>
              <span className={`${donutCenterLabel}`}>Net Cash Flow</span>
            </Flex>
          </>
        ) : (
          <Flex className={`${chartLoading}`} align="center" justify="center">
            <Empty description="No cash movement this month" />
          </Flex>
        )}
      </Flex>

      <Flex vertical className={`${donutLegend}`}>
        {legend.map((item) => (
          <Flex
            key={item.label}
            className={`${donutLegendRow}`}
            align="center"
            justify="space-between"
          >
            <Flex className={`${donutLegendKey}`} align="center" gap={8}>
              <span
                className={`${donutLegendDot}`}
                style={{ background: item.color }}
              />
              {item.label}
            </Flex>
            <span className={`${donutLegendValue}`}>
              {formatMoney(item.value)}
            </span>
          </Flex>
        ))}
      </Flex>
    </>
  );
};

export default CashFlowDonut;
