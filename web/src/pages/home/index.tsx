import { Button, Space } from 'antd';

export default function Home() {
  console.log(import.meta.env);

  return (
    <Space direction="horizontal">
      <Button>regular button </Button>
      <Button type="dashed"> dashed</Button>
      <div className="rounded-sm hover:bg-slate-400  px-2 py-1">custom button</div>
    </Space>
  );
}
