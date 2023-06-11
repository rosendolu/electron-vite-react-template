import { Button, Checkbox, Form, Input, List, Space, Table, Typography } from 'antd';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function Index() {
  const [checkedList, setCheckList] = useState(() => plainOptions.map(item => item.label));
  const [list, setList] = useState([]);
  const [form] = Form.useForm();
  function onFormChange(e) {
    // console.log(e);
  }

  function formatHighlight(list) {
    return list.map(({ label, data: arr }) => {
      const res = { label, data: null };
      res.data = arr.map(data => {
        const content = data.docClob || '';
        const queryText = form.getFieldValue('queryText') || '';
        if (queryText) {
          data.contents = content.split(new RegExp(`(${queryText})`, 'i'));
        } else {
          data.contents = [content];
        }
        return data;
      });
      return res;
    });
  }
  async function submit() {
    const params = form.getFieldsValue(true);

    params.scope = params.scope.map(item => plainOptions.filter(data => data.label == item)[0]).filter(item => item);
    if (params.scope.length == 0) {
      toast.error('请选择搜索范围后再试');
      return;
    }
    console.log('params', params);
    let toastID = '';
    if (toastID) {
      toastID = toast.loading('重新搜索中...', { id: toastID });
    } else {
      toastID = toast.loading('搜索中...');
    }
    const list = await window.$bridge.scrapper.getPunishmentList(params);
    toast.success('查询成功', { id: toastID });

    setList(formatHighlight(list));
    console.log('list', list);
    form.resetFields(['count', 'scope', 'queryText']);
    toastID = '';
  }
  return (
    <div className="p-4">
      <div className="text-center">
        <Typography.Title level={2} style={{ textAlign: 'center' }}>
          行政处罚记录
        </Typography.Title>
        <Space direction="horizontal" size={'middle'}>
          <Form
            form={form}
            onValuesChange={onFormChange}
            style={{ textAlign: 'center' }}
            layout="inline"
            initialValues={{ count: 10, queryText: '', scope: checkedList }}>
            <Form.Item label="关键词" name={'queryText'}>
              <Input placeholder="请输入搜索关键词" type="text" />
            </Form.Item>
            <Form.Item label="检索数量" name="count">
              <Input className="min-w-[200px]" placeholder="默认10条" type="number" maxLength={4} min={10} max={1e3} />
            </Form.Item>
            <Form.Item label="选择范围" name="scope">
              <Checkbox.Group>
                {plainOptions.map(data => (
                  <Checkbox key={data.label} value={data.label}>
                    {data.label}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={submit}>
                搜索
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </div>
      <div className="pt-10">
        <Space direction="vertical" size={'large'} style={{ width: '100%' }}>
          {list.map((data, i) => (
            <RecordList key={i} data={data} keywords={form.getFieldValue('queryText')}></RecordList>
          ))}
        </Space>
      </div>
    </div>
  );
}

function RecordList({ data, keywords }) {
  data.data = data.data.map(item => {
    item.key = item.docId;
    return item;
  });
  const [expandList, setExpandList] = useState([]);
  const columns = [
    {
      title: '标题',
      dataIndex: 'docSubtitle',
      key: 'docSubtitle',
    },
    {
      title: '发布时间',
      dataIndex: 'publishDate',
      key: 'publishDate',
    },
    {
      title: '正文',
      dataIndex: 'docClob',
      key: 'docClob',
      render: text => <Typography>{text.slice(0, 200)}</Typography>,
    },
    {
      title: '原文',
      dataIndex: 'url',
      key: 'url',
      render: url => (
        <Typography.Link target="_blank" href={url}>
          原文
        </Typography.Link>
      ),
    },
  ];
  function expand(open, item) {
    if (open) {
      setExpandList(list => list.concat(item.docId));
    } else {
      setExpandList(list => list.filter(key => key !== item.docId));
    }
    // console.log(expandList);
  }
  return (
    <List
      header={
        <div className="text-center">
          <Typography.Title level={3}>{data.label}</Typography.Title>
        </div>
      }
      footer={<div className="text-center">共{data.data?.length}条数据</div>}
      bordered
      dataSource={data.data}
      // renderItem={item => (
      //   <div key={item.publishDate}>
      //     <List.Item>
      //       <div>
      //         <Typography.Text>{item.docTitle}</Typography.Text> <Divider type="vertical" />
      //         <Typography.Text>{item.publishDate}</Typography.Text>
      //       </div>
      //     </List.Item>
      //     <List.Item>
      //       {item.contents.map(str => {
      //         return (
      //           <Typography.Text key={str} mark={str === keywords}>
      //             {str}
      //           </Typography.Text>
      //         );
      //       })}
      //     </List.Item>
      //   </div>
      // )}
    >
      <Table
        expandable={{
          onExpand: expand,
          expandRowByClick: true,
          expandedRowRender: record =>
            record.contents.map(str => {
              return (
                <Typography.Text key={str} mark={str == keywords}>
                  {str}
                </Typography.Text>
              );
            }),
          rowExpandable: record => true,
          expandedRowKeys: expandList,
        }}
        dataSource={data.data}
        columns={columns}
      />
    </List>
  );
}

const plainOptions = [
  {
    key: 'total',
    itemId: 4113,
    label: '总局',
  },
  {
    key: 'province',
    itemId: 4114,
    label: '省局',
  },
  {
    key: 'branch',
    itemId: 4115,
    label: '分局',
  },
];
