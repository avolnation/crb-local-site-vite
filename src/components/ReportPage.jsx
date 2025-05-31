import { useEffect, useState } from 'react';
import { DatePicker, Select, Input, Button, Table, message } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import {
    Document, Packer, Paragraph, TextRun, Table as DocxTable, TableRow, TableCell,
    WidthType, AlignmentType
} from 'docx';
import { saveAs } from 'file-saver';

const { RangePicker } = DatePicker;

const WorktimeReport = () => {
    const [range, setRange] = useState([]);
    const [subdivisions, setSubdivisions] = useState([]);
    const [selectedSubdivision, setSelectedSubdivision] = useState(null);
    const [fio, setFio] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const selectedSubdivisionLabel = subdivisions.find(s => s.value === selectedSubdivision)?.label || '';

    useEffect(() => {
        axios.get('http://192.168.100.75:5000/api/structsubs')
            .then(res => {
                if (res.data.success) {
                    setSubdivisions(res.data.data.map(item => ({
                        label: item.structsub,
                        value: item.id
                    })));
                } else {
                    message.error('Ошибка загрузки подразделений');
                }
            })
            .catch(() => message.error('Ошибка соединения с сервером'));
    }, []);

    const fetchReport = async () => {
        if (!range.length || !selectedSubdivision) {
            return message.warning('Выберите даты и подразделение');
        }

        setLoading(true);
        try {
            const response = await axios.get('http://192.168.100.75:5000/api/report/worktime', {
                params: {
                    startDate: range[0].format('YYYY-MM-DD'),
                    endDate: range[1].format('YYYY-MM-DD'),
                    subdivisionId: selectedSubdivision,
                    fio: fio.trim() || undefined
                }
            });
            if (response.data.success) {
                const formatted = response.data.data.map(row => ({
                    ...row,
                    date: dayjs(row.date).format('DD.MM.YYYY'),
                    came_at: /^\d{2}:\d{2}:\d{2}/.test(row.came_at) ? row.came_at.split(".")[0] : 'Нет отметки',
                    left_at: /^\d{2}:\d{2}:\d{2}/.test(row.left_at) ? row.left_at.split(".")[0] : 'Нет отметки',
                }));
                setData(formatted);
            } else {
                message.error(response.data.message || 'Ошибка при получении отчета');
            }
        } catch {
            message.error('Ошибка при загрузке данных');
        } finally {
            setLoading(false);
        }
    };

    const generateWord = () => {
        if (data.length === 0) {
            return message.warning('Нет данных для экспорта');
        }

        const groupedByDate = data.reduce((acc, row) => {
            if (!acc[row.date]) acc[row.date] = [];
            acc[row.date].push(row);
            return acc;
        }, {});

        const dates = Object.entries(groupedByDate);

        const sections = dates.map(([date, entries], index) => {
            const headerRow = new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({
                            children: [
                                new TextRun({
                                    text: "ФИО",
                                    bold: true,
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),],
                        width: { size: 35, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Должность",
                                    bold: true,
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),],
                        width: { size: 30, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Пришел(-ла) на работу",
                                    bold: true,
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),],
                        width: { size: 17.5, type: WidthType.PERCENTAGE }
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Ушел(-ла) с работы",
                                    bold: true,
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),],
                        width: { size: 17.5, type: WidthType.PERCENTAGE }
                    })
                ]
            });

            const rows = [
                headerRow,
                ...entries.map(e => new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph(` ${e.fio}`)] }),
                        new TableCell({ children: [new Paragraph(` ${e.position}`)] }),
                        new TableCell({ children: [new Paragraph(` ${e.came_at}`)] }),
                        new TableCell({ children: [new Paragraph(` ${e.left_at}`)] }),
                    ]
                }))
            ];

            return [
                ...(index > 0 ? [new Paragraph({ children: [] })] : []),
                // new Paragraph({
                //   text: `Дата ${date}`,
                //   heading: 'HEADING_2',
                //   spacing: { after: 200 },
                //   bold: true
                // }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Дата ${date}`,
                            bold: true,
                        }),
                    ],
                    alignment: AlignmentType.LEFT,
                }),
                new DocxTable({
                    rows,
                    width: { size: 100, type: WidthType.PERCENTAGE },
                })
            ];
        });

        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 567,    // 1 см
                            bottom: 567, // 1 см
                            left: 590,   // 1.04 см
                            right: 340,  // 0.6 см
                        },
                    },
                },
                styles: {
                    default: {
                        document: {
                            run: {
                                font: "Calibri",
                                size: 22, // 11pt font size (size is in half-points)
                            },
                            paragraph: {
                                font: "Calibri",
                                spacing: { line: 360 }, // 1.5 line spacing (in twips, 240 twips = 1 line)
                            },
                        },
                    },
                },
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Акт контрольной фиксации отработки рабочего времени сотрудников учреждения здравоохранения "Буда-Кошелевская центральная районная больница"`,
                                bold: true,
                                size: 28
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `${selectedSubdivisionLabel}`,
                                bold: true,
                                size: 32
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    }),
                    ...sections.flat()
                ]
            }]
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "Отчёт_по_рабочему_времени.docx");
        });
    };

    const columns = [
        { title: 'Дата', dataIndex: 'date', width: 120 },
        { title: 'ФИО', dataIndex: 'fio', width: 220 },
        { title: 'Должность', dataIndex: 'position', width: 200 },
        { title: 'Пришел', dataIndex: 'came_at', width: 120 },
        { title: 'Ушел', dataIndex: 'left_at', width: 120 }
    ];

    return (
        <div style={{ padding: 24 }}>
            <h2>Отчёт по рабочему времени</h2>
            <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <RangePicker
                    value={range}
                    onChange={setRange}
                    style={{ minWidth: 250 }}
                />
                <Select
                    placeholder="Выберите подразделение"
                    value={selectedSubdivision}
                    onChange={setSelectedSubdivision}
                    options={subdivisions}
                    style={{ minWidth: 250 }}
                />
                <Input
                    placeholder="ФИО (необязательно)"
                    value={fio}
                    onChange={e => setFio(e.target.value)}
                    style={{ width: 200 }}
                />
                <Button type="primary" onClick={fetchReport}>
                    Сформировать
                </Button>
                <Button onClick={generateWord} disabled={!data.length}>
                    Скачать Word
                </Button>
            </div>

            <Table
                rowKey={(row) => row.fio + row.date}
                dataSource={data}
                columns={columns}
                loading={loading}
                bordered
                pagination={{ pageSize: 20 }}
                scroll={{ x: 'max-content', y: 500 }}
            />
        </div>
    );
};

export default WorktimeReport;
