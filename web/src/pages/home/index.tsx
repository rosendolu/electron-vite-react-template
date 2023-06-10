import { Button, Space } from 'antd';
import { toast } from 'react-hot-toast';

export default function Index() {
  async function sayHello() {
    toast.success(window.$bridge.versions.electron || '');
    // console.log(window.$bridge.msg.hello());
    const res = await window.$bridge.msg.hello();
    console.log(res);
    toast.success(res || 'xxx');
    // myAPI.hello();
  }
  return (
    <Space direction="horizontal">
      <Button onClick={sayHello}> sayHello </Button>
    </Space>
  );
}
