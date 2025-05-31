import React, { useState, useForm } from 'react';
import axios from 'axios';
import { ConfigProvider, Form, Input, List, Select, Checkbox, Button, Modal, message, Table, Dropdown, Menu, DatePicker } from 'antd';
import ruRU from 'antd/locale/ru_RU'
import dayjs from 'dayjs'
import moment from 'moment'

const CheckMark = () => {
  const [fio, setFio] = useState('');
  const [result, setResult] = useState('');
  const [marks, setMarks] = useState([])
  const [is_marks_modal_open, set_is_mark_modal_open] = useState(false)
  const [form] = Form.useForm()

  const handle_marks_modal_close = () => {
    set_is_mark_modal_open(false)
  }


  const handleSubmit = async (values) => {
    try {
      const { fio, data } = values;
      const response = await axios.get('http://localhost:5000/api/check-mark', {
        params: {
          fio,
          data: data ? data.format('YYYY-MM-DD') : undefined, // Отправляем только дату
        },
      });

      if (response.data.success) {
        setMarks(response.data.data);
        console.log('Marks from server:', response.data.data);
        set_is_mark_modal_open(true);
      } else {
        message.error(response.data.message || 'Ошибка при получении данных');
      }
    } catch (error) {
      message.error('Ошибка при запросе к серверу');
      console.error(error);
    }

  };

  // Функция для форматирования длительности в ЧЧ:ММ:СС
  const formatDuration = (duration) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const normalizeTimeString = (timeStr) => {
    const [main, ms] = timeStr.split('.');
    if (!ms) return timeStr;
    if (ms.length === 1) return `${main}.${ms}00`;
    if (ms.length === 2) return `${main}.${ms}0`;
    return `${main}.${ms.slice(0, 3)}`; // если больше трёх — обрезаем
  };

  // Функция для обработки и группировки записей
  const processMarks = () => {
    console.log('Original marks:', marks);

    // Группировка по fio и дате
    const groupedMarks = marks.reduce((acc, mark) => {
      const date = dayjs(mark.data).format('YYYY-MM-DD');
      const key = `${mark.fio}_${date}`;
      if (!acc[key]) {
        acc[key] = { fio: mark.fio, date, records: [] };
      }
      acc[key].records.push(mark);
      return acc;
    }, {});

    // Обработка групп
    const processed = Object.values(groupedMarks).map((group) => {
      // Фильтрация дубликатов (разница менее 5 секунд)
      const uniqueRecords = [];
      group.records.forEach((record) => {
        const rawTimeStr = record.time.split('+')[0];
        const timeStr = normalizeTimeString(rawTimeStr);
        const recordTime = dayjs(
          `${dayjs(record.data).format('YYYY-MM-DD')} ${timeStr}`,
          ['YYYY-MM-DD HH:mm:ss.SSS', 'YYYY-MM-DD HH:mm:ss.SS', 'YYYY-MM-DD HH:mm:ss.S', 'YYYY-MM-DD HH:mm:ss'],
          true
        );
        if (!recordTime.isValid()) {
          console.error(`Invalid time format for ${timeStr} in record:`, record);
          return;
        }
        const isDuplicate = uniqueRecords.some((existing) => {
          const existingTime = dayjs(
            `${dayjs(existing.data).format('YYYY-MM-DD')} ${existing.time.split('+')[0]}`,
            ['YYYY-MM-DD HH:mm:ss.SSS', 'YYYY-MM-DD HH:mm:ss.SS', 'YYYY-MM-DD HH:mm:ss.S', 'YYYY-MM-DD HH:mm:ss'],
            true
          );
          if (!existingTime.isValid()) {
            console.error(`Invalid existing time format for ${existing.time.split('+')[0]} in record:`, existing);
            return false;
          }
          const diffSeconds = Math.abs(recordTime.diff(existingTime, 'second'));
          console.log(`Comparing ${timeStr} with ${existing.time.split('+')[0]}: ${diffSeconds} seconds`);
          return diffSeconds < 5;
        });
        if (!isDuplicate) {
          uniqueRecords.push(record);
        } else {
          console.log(`Excluded as duplicate: ${timeStr}`);
        }
      });

      console.log('Unique records:', uniqueRecords);

      // Сортировка записей по времени
      const sortedRecords = uniqueRecords.sort((a, b) => {
        const timeA = dayjs(
          `${dayjs(a.data).format('YYYY-MM-DD')} ${a.time.split('+')[0]}`,
          ['YYYY-MM-DD HH:mm:ss.SSS', 'YYYY-MM-DD HH:mm:ss.SS', 'YYYY-MM-DD HH:mm:ss.S', 'YYYY-MM-DD HH:mm:ss'],
          true
        );
        const timeB = dayjs(
          `${dayjs(b.data).format('YYYY-MM-DD')} ${b.time.split('+')[0]}`,
          ['YYYY-MM-DD HH:mm:ss.SSS', 'YYYY-MM-DD HH:mm:ss.SS', 'YYYY-MM-DD HH:mm:ss.S', 'YYYY-MM-DD HH:mm:ss'],
          true
        );
        if (!timeA.isValid() || !timeB.isValid()) {
          console.error('Invalid time during sorting:', { timeA: a.time, timeB: b.time });
          return 0;
        }
        return timeA - timeB;
      });

      console.log('Sorted records:', sortedRecords);

      // Проверка, что остались записи
      if (sortedRecords.length === 0) {
        console.warn('No valid records after filtering for group:', group);
        return { records: [], workedTime: null };
      }

      // Определение типа записи и подсчёт отработанного времени
      let workedTime = null;
      const records = sortedRecords.map((record, index, array) => {
        const rawTimeStr = record.time.split('+')[0];
        const timeStr = normalizeTimeString(rawTimeStr);
        const time = dayjs(
          `${dayjs(record.data).format('YYYY-MM-DD')} ${timeStr}`,
          ['YYYY-MM-DD HH:mm:ss.SSS', 'YYYY-MM-DD HH:mm:ss.SS', 'YYYY-MM-DD HH:mm:ss.S', 'YYYY-MM-DD HH:mm:ss'],
          true
        );
        if (!time.isValid()) {
          console.error(`Invalid time in type assignment for ${timeStr}:`, record);
          return null;
        }

        let type = 'Не определено';

        if (array.length === 1) {
          type = time.hour() < 12 ? 'Вход' : 'Выход';
        } else {
          if (index === 0 && time.hour() < 12) {
            type = 'Вход';
          } else if (index === array.length - 1 && time.hour() >= 12) {
            type = 'Выход';
          }
        }

        return {
          fio: record.fio,
          data: record.data,
          time: record.time,
          type,
        };
      }).filter(record => record !== null);

      console.log('Processed records:', records);

      // Подсчёт отработанного времени — просто от первой до последней записи
      if (sortedRecords.length >= 2) {
        const first = sortedRecords[0];
        const last = sortedRecords[sortedRecords.length - 1];

        const timeStartStr = normalizeTimeString(first.time.split('+')[0]);
        const timeEndStr = normalizeTimeString(last.time.split('+')[0]);

        const start = dayjs(`${dayjs(first.data).format('YYYY-MM-DD')} ${timeStartStr}`, 'YYYY-MM-DD HH:mm:ss.SSS', true);
        const end = dayjs(`${dayjs(last.data).format('YYYY-MM-DD')} ${timeEndStr}`, 'YYYY-MM-DD HH:mm:ss.SSS', true);

        if (start.isValid() && end.isValid() && end.diff(start, 'second') > 0) {
          workedTime = formatDuration(end.diff(start, 'second'));
        } else {
          console.warn('Invalid start/end or negative duration:', { start, end });
        }
      }


      return { records, workedTime };
    });

    return {
      records: processed.flatMap(group => group.records).filter(record => record.type !== 'Не определено'),
      workedTime: processed[0]?.workedTime || null,
    };
  };

  const { records: processedMarks, workedTime } = processMarks();

  console.log(processedMarks)
  console.log(workedTime)




  return (
    <ConfigProvider locale={ruRU}>
      <div>
        <h2>Проверить отметку</h2>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical">
          <Form.Item
            label="ФИО"
            name="fio"
            rules={[{ required: true, message: 'Пожалуйста, укажите, ФИО' }]}
          >
            <Input placeholder='Введите полное ФИО'></Input>
          </Form.Item>
          <Form.Item
            name="data"
            label="Дата"
            rules={[{ required: true, message: 'Пожалуйста, укажите, ФИО' }]}>
            <DatePicker
              format="DD.MM.YYYY"
              placeholder='Выберите дату'>
            </DatePicker>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Проверить
            </Button>
          </Form.Item>
        </Form>
        <Modal 
          open={is_marks_modal_open} 
          onCancel={handle_marks_modal_close}
          footer={null}
        >
          {marks.length === 0 ? (
            <p>Нет данных для отображения.</p>
          ) : (
            <>
              <List
                dataSource={processedMarks}
                renderItem={(item) => (
                  <List.Item>
                    <div>
                      <strong>ФИО:</strong> {item.fio || 'Не указано'} <br />
                      <strong>Дата и время:</strong>{' '}
                      {item.data && item.time
                        ?
                        `${dayjs(item.data).format('DD-MM-YYYY')} ${item.time.split('+')[0].split('.')[0]}`
                        : 'Не указана'} <br />
                      <strong>Тип:</strong> {item.type}
                    </div>
                  </List.Item>
                )}
              />
              {workedTime && (
                <p style={{ marginTop: '10px', fontWeight: 'bold', textAlign: 'center' }}>
                  Отработанное время (с учётом обеда): {workedTime}
                </p>
              )}
            </>
          )}
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default CheckMark;