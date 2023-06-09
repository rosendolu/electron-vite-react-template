import { Button, Space } from 'antd';
import { toast } from 'react-hot-toast';

export default function Index() {
  async function sayHello() {
    toast.success(window.$bridge.versions.electron || '');
    // console.log(window.$bridge.msg.hello());
    const res = await window.$bridge.msg.hello({ a: 1, b: 2 });
    toast.success(res || 'hello hi');
    // myAPI.hello();
  }
  return (
    <Space direction="horizontal">
      <Button onClick={sayHello}> sayHello </Button>
    </Space>
  );
}
