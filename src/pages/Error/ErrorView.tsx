import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const ErrorView = () => {
  const navigate = useNavigate();

  return (
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
  );
};

export default ErrorView;
