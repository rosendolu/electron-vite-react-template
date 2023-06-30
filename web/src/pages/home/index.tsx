import { Button, DatePicker, Form, Input, List, Modal, Progress, Select, Space, Spin, Table, Typography } from 'antd';
import locale from 'antd/es/date-picker/locale/zh_CN';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useBoolean, useEffectOnce, useInterval } from 'usehooks-ts';
import { deepClone } from '../../helpers/utils';

export default function Index() {
  const targetOptions = [
    { value: 930, label: '行政许可' },
    { value: 931, label: '行政处罚' },
  ];
  const pageSize = 18;
  const punishment = [
    {
      value: 4113,
      label: '总局',
    },
    {
      value: 4114,
      label: '省局',
    },
    {
      value: 4115,
      label: '分局',
    },
  ];

  const permit = [
    {
      value: 4110,
      label: '总局',
    },
    {
      value: 4111,
      label: '省局',
    },
    {
      value: 4112,
      label: '分局',
    },
  ];
  const [subTargetOptions, setSubTargetOptions] = useState<any>(permit);
  const [list, setList] = useState([]);
  const [form] = Form.useForm();
  const [syncProgress, setSyncProgress] = useState<any[]>([]);
  const { value: finishedSync, setValue: changeSyncState } = useBoolean(false);
  const defaultDate = [dayjs().subtract(1, 'day'), dayjs()];
  const dateRef = useRef<any[]>(defaultDate);
  useEffect(() => {
    // @ts-ignore
    const left = syncProgress.filter(item => item.progress !== item.total);
    if (left.length == 0 && syncProgress.length !== 0) {
      changeSyncState(true);
    }
  }, [changeSyncState, syncProgress]);

  useEffectOnce(() => {
    window.$bridge?.scrapper
      .syncData({ type: 'progress' })
      .then(data => {
        console.log('progress', data);
        setSyncProgress(data);
      })
      .catch();
  });
  useEffect(() => {
    form.setFieldValue(
      'subTarget',
      subTargetOptions.map(item => item.value)
    );
  }, [subTargetOptions, form]);

  useInterval(
    () => {
      window.$bridge?.scrapper
        .syncData({ type: 'progress' })
        .then(data => {
          console.log('progress', data);
          setSyncProgress(data);
        })
        .catch();
    },
    finishedSync ? null : 3e3
  );
  useEffect(() => {
    startSyncData().catch();
  }, []);
  async function startSyncData() {
    //

    const res = await window.$bridge.scrapper.syncData({ type: 'sync' }).catch();
    console.log('sync', res);
  }

  function onFormChange(e) {
    const { target, date } = e;
    console.log('formchange', e);

    if (target) {
      setSubTargetOptions(target == 930 ? permit : punishment);
    }
    // if (date) {
    //   form.setFieldValue(
    //     'date',
    //     date.map(time => dayjs(time).format('YYYY-MM-DD HH:mm'))
    //   );
    // }
    dateRef.current = date;
    // console.log(date?.map(time => dayjs(time).format('YYYY-MM-DD HH:mm')));
  }

  function formatHighlight(list) {
    return list.map(({ label, data: arr, total, value }) => {
      const res = { label, data: null, total, value };
      res.data = arr.map(data => {
        if (typeof data !== 'object') {
          data = JSON.parse(data);
        }
        const content = data.textContent || '';
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
    const params = deepClone(form.getFieldsValue(true));
    console.log('params before', params);
    const totalList = permit.concat(punishment);
    params.subTarget = (params.subTarget || []).map(val => totalList.find(item => item.value == val)).filter(val => !!val);
    params.target = targetOptions.find(item => item.value == params.target);
    params.date = dateRef.current?.map(time => dayjs(time).format('YYYY-MM-DD HH:mm')) || [];
    // params.date = params.date?.length ? params.date.map(time => time.getTime()) : [];
    console.log('params', params);
    if (params.subTarget.length == 0) {
      toast.error('请选择搜索范围后再试', { duration: 1e3 });
      return;
    }
    let toastID = '';
    if (toastID) {
      toastID = toast.loading('重新搜索中...', { id: toastID });
    } else {
      toastID = toast.loading('搜索中...');
    }
    try {
      const list = await window.$bridge.scrapper.cbirc(params);
      toast.success('查询成功', { id: toastID });

      setList(formatHighlight(list));
      console.log('list', list);
    } catch (error) {
      toast.error('搜索失败，请稍后再试', { duration: 1e3 });
      console.log(error);
    } finally {
      toast.dismiss(toastID);
      toastID = '';
    }
  }
  return (
    <div className="p-4">
      {/* @ts-ignore */}
      <div className="text-center">
        <Typography.Title level={2} style={{ textAlign: 'center' }}>
          市场监督管理局
        </Typography.Title>
        <Space direction="vertical">
          <Typography.Text>总数据: {(syncProgress?.[0]?.total || 0) * pageSize}条</Typography.Text>
        </Space>
        <Space direction="horizontal" size={'middle'}>
          <Form
            form={form}
            onValuesChange={onFormChange}
            style={{ textAlign: 'center' }}
            layout="inline"
            initialValues={{
              count: 10,
              queryText: '',
              subTarget: subTargetOptions.map(item => item.value),
              target: targetOptions[0].value,
              date: defaultDate,
            }}>
            <Form.Item label="关键词" name={'queryText'} className="mt-2">
              <Input placeholder="请输入搜索关键词" type="text" />
            </Form.Item>
            {/* <Form.Item label="检索数量" name="count" className="mt-2">
              <Input className="min-w-[200px]" placeholder="默认10条" type="number" maxLength={4} min={10} max={1e3} />
            </Form.Item> */}
            <Form.Item name="target" label="搜索类别" style={{ minWidth: '160px' }} className="mt-2">
              <Select options={targetOptions}></Select>
            </Form.Item>
            <Form.Item label="选择范围" name="subTarget" style={{ minWidth: '160px' }} className="mt-2">
              <Select
                mode="multiple"
                allowClear
                style={{ minWidth: '150px' }}
                placeholder="选择搜索范围"
                options={subTargetOptions}
                // onChange={handleChange}
              />
            </Form.Item>
            <Form.Item label="选择时间范围" name="date" className="mt-2">
              <DatePicker.RangePicker locale={locale} format="YYYY-MM-DD HH:mm"></DatePicker.RangePicker>
            </Form.Item>
            <Form.Item className="mt-2">
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
      <Modal title="同步数据中..." open={!finishedSync} closable={false} footer={null} className="text-center py-4">
        <Space direction="vertical" size={20} className="w-full">
          <Spin size="large"></Spin>
          <Typography.Title level={4}>总进度</Typography.Title>
          <Progress
            type="dashboard"
            percent={syncProgress.length ? ((syncProgress.filter(item => item.progress === item.total).length / syncProgress.length) * 100) >> 0 : 0}
          />
          {syncProgress.map(
            (item, i) =>
              // @ts-ignore
              item.progress !== item.total && (
                <>
                  <Space direction="vertical" key={i} className="w-full">
                    {/* @ts-ignore */}
                    <Typography.Title level={5}>{item.label}</Typography.Title>
                    {/* @ts-ignore */}
                    <Progress percent={((item.progress / item.total) * 100) >> 0} size={['100%', 10]} />
                  </Space>
                </>
              )
          )}
        </Space>
      </Modal>
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
      dataIndex: 'textContent',
      key: 'textContent',
      render: text => <Typography>{text.slice(50, 200)}</Typography>,
    },
    // {
    //   title: '原文',
    //   dataIndex: 'url',
    //   key: 'url',
    //   render: url => (
    //     <Typography.Link target="_blank" href={url}>
    //       原文
    //     </Typography.Link>
    //   ),
    // },
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
            record.contents.map((str, i) => {
              return (
                <Typography.Text key={i} mark={str == keywords}>
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
