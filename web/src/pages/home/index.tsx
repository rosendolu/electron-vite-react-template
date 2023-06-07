import { Button, Space } from 'antd';
import { toast } from 'react-hot-toast';

export default function Index() {
  function sayHello() {
    // alert(versions.electron || 'xx');
    toast.loading(versions.electron() || '');
    console.log(versions.hello());
    // myAPI.hello();
  }
  return (
    <Space direction="horizontal">
      <Button onClick={sayHello}> sayHello </Button>
    </Space>
  );
}
