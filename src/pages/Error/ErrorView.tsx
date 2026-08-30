import { Button, Flex, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { errorCard, errorPage } from "../../styles/layout/public.layout.css";

const ErrorView = () => {
  const navigate = useNavigate();

  return (
    <Flex className={`${errorPage}`} align="center" justify="center">
      <Flex className={`${errorCard}`} vertical>
        <Result
          status="404"
          title="Page not found"
          subTitle="The page you are looking for does not exist or has moved."
          extra={
            <Button type="primary" onClick={() => navigate("/")}>
              Back home
            </Button>
          }
        />
      </Flex>
    </Flex>
  );
};

export default ErrorView;
