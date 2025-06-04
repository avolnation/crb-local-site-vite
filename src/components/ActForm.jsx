import { useState } from "react";
import { Button, DatePicker, Form, Input, Space, Typography, Row, Col, Divider, Popconfirm } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, AlignmentType } from "docx";
import moment from "moment";
import "moment/dist/locale/ru";

const { Title } = Typography;

const WriteOffAct = () => {
    const [date, setDate] = useState(null);
    const [materials, setMaterials] = useState([{ name: "", quantity: "", price: "", total: "", note: "" }]);
    const [members, setMembers] = useState([{ position: "", name: "" }, { position: "", name: "" }, { position: "", name: "" }]);

    const addMaterial = () => setMaterials([...materials, { name: "", quantity: "", price: "", total: "", note: "" }]);
    const removeMaterial = (index) => {
        const updated = [...materials];
        updated.splice(index, 1);
        setMaterials(updated);
    };

    const handleMaterialChange = (index, field, value) => {
        const updated = [...materials];
        updated[index][field] = value;
        setMaterials(updated);
    };

    const handleMemberChange = (index, field, value) => {
        const updated = [...members];
        updated[index][field] = value;
        setMembers(updated);
    };

    const generateDoc = async () => {
        const minRows = 10;
        let tableData = [...materials];
        if (tableData.length < minRows) {
            const emptyRows = Array(minRows - tableData.length).fill({
                name: "", quantity: "", price: "", total: "", note: ""
            });
            tableData = [...tableData, ...emptyRows];
        }

        const tableRows = [
            new TableRow({
                children: ["№ п/п", "Наименование материала", "Кол-во", "Цена", "Сумма", "Примечание"].map(
                    (text) =>
                        new TableCell({
                            children: [new Paragraph({ children: [new TextRun({ text, bold: true })], alignment: AlignmentType.CENTER })],
                        })
                ),
            }),
            ...tableData.map((mat, idx) =>
                new TableRow({
                    children: [
                        `${idx + 1}`, mat.name, mat.quantity, mat.price, mat.total, mat.note,
                    ].map(
                        (text) =>
                            new TableCell({
                                children: [new Paragraph({ text: text || "", alignment: AlignmentType.CENTER })],
                            })
                    ),
                })
            ),
        ];

        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: { size: 28 },
                    },
                },
            },
            sections: [
                {
                    children: [
                        new Paragraph({ children: [new TextRun({ text: "УЗ «Буда-Кошелевская ЦРБ»", bold: true })], alignment: AlignmentType.LEFT }),
                        new Paragraph({ children: [new TextRun("УТВЕРЖДАЮ:")], alignment: AlignmentType.RIGHT }),
                        new Paragraph({ text: "_________________________", alignment: AlignmentType.RIGHT, spacing: { before: 100 } }),
                        new Paragraph({
                            children: [new TextRun({ text: "подпись, Ф.И.О.", italics: true, size: 20 })],
                            alignment: AlignmentType.RIGHT,
                        }),
                        new Paragraph({ text: "«__» __________ 20__ г.", alignment: AlignmentType.RIGHT, spacing: { after: 200 } }),
                        new Paragraph({ children: [new TextRun({ text: "АКТ", bold: true })], alignment: AlignmentType.CENTER }),
                        new Paragraph({ children: [new TextRun({ text: "О СПИСАНИИ МАТЕРИАЛОВ", bold: true })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
                        new Paragraph({
                            text: `за ${moment(date).locale("ru").format("LL")}`,
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 400 },
                        }),
                        new Paragraph({ children: [new TextRun("Мы, нижеподписавшиеся, комиссия в составе:")], spacing: { after: 200 } }),
                        ...members.flatMap((m) => [
                            new Paragraph({ text: `${m.position || "____________________"} - ${m.name || "____________________"}` }),
                        ]),
                        new Paragraph({
                            text: `Составили настоящий акт на списание следующих материалов в отделении: ______________________________________________________`,
                            spacing: { before: 200, after: 200 },
                        }),
                        new Table({ rows: tableRows, width: { size: 100, type: "pct" } }),
                        new Paragraph({
                            children: [
                                new TextRun("Акт составлен для снятия с подотчета "),
                                new TextRun({ text: "заведующего сектором АСУ, Кутукина А.С.", italics: true, bold: true }),
                            ],
                            spacing: { before: 200 },
                        }),
                        new Paragraph({ text: "Комиссия:", spacing: { before: 400 } }),

                        new Table({
                            width: { size: 100, type: "pct" },
                            borders: {
                                top: { style: "none", size: 0, color: "FFFFFF" },
                                bottom: { style: "none", size: 0, color: "FFFFFF" },
                                left: { style: "none", size: 0, color: "FFFFFF" },
                                right: { style: "none", size: 0, color: "FFFFFF" },
                                insideHorizontal: { style: "none", size: 0, color: "FFFFFF" },
                                insideVertical: { style: "none", size: 0, color: "FFFFFF" },
                            },
                            rows: members.map((m) => [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [
                                                new Paragraph({
                                                    text: m.position || "должность",
                                                    alignment: AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                        new TableCell({
                                            children: [
                                                new Paragraph({
                                                    text: "_______________",
                                                    alignment: AlignmentType.CENTER,
                                                }),
                                            ],
                                        }),
                                        new TableCell({
                                            children: [
                                                new Paragraph({
                                                    text: m.name || "ФИО",
                                                    alignment: AlignmentType.CENTER,
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [
                                                new Paragraph({
                                                    children: [new TextRun({ text: "\t\tдолжность", italics: true, size: 20 })],
                                                    alignment: AlignmentType.LEFT,
                                                }),
                                            ],
                                        }),
                                        new TableCell({
                                            children: [
                                                new Paragraph({
                                                    children: [new TextRun({ text: "подпись", italics: true, size: 20 })],
                                                    alignment: AlignmentType.CENTER,
                                                }),
                                            ],
                                        }),
                                        new TableCell({
                                            children: [
                                                new Paragraph({
                                                    children: [new TextRun({ text: "Ф.И.О.", italics: true, size: 20 })],
                                                    alignment: AlignmentType.CENTER,
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ]).flat(),
                        }),
                    ],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, "akt-spisaniya.docx");
    };

    return (
        <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
            <Title level={3}>Акт на списание материалов</Title>

            <Form layout="vertical">
                <Form.Item label="Дата документа">
                    <DatePicker
                        format="DD.MM.YYYY"
                        style={{ width: "100%" }}
                        value={date ? moment(date) : null}
                        onChange={(value) => setDate(value ? value.toDate() : null)}
                    />
                </Form.Item>

                <Divider orientation="left">Материалы</Divider>
                {materials.map((mat, index) => (
                    <Space key={index} style={{ display: "flex", marginBottom: 8 }} align="start">
                        {["name", "quantity", "price", "total", "note"].map((field) => (
                            <Input
                                key={field}
                                placeholder={
                                    field === "name"
                                        ? "Наименование"
                                        : field === "quantity"
                                            ? "Кол-во"
                                            : field === "price"
                                                ? "Цена"
                                                : field === "total"
                                                    ? "Сумма"
                                                    : "Примечание"
                                }
                                value={mat[field]}
                                onChange={(e) => handleMaterialChange(index, field, e.target.value)}
                                style={{ width: 120 }}
                            />
                        ))}
                        {materials.length > 1 && (
                            <Popconfirm title="Удалить материал?" onConfirm={() => removeMaterial(index)}>
                                <Button danger icon={<MinusCircleOutlined />} />
                            </Popconfirm>
                        )}
                    </Space>
                ))}
                <Form.Item>
                    <Button type="dashed" onClick={addMaterial} block icon={<PlusOutlined />}>
                        Добавить материал
                    </Button>
                </Form.Item>

                <Divider orientation="left">Члены комиссии</Divider>
                {members.map((member, index) => (
                    <Row gutter={8} key={index} style={{ marginBottom: 8 }}>
                        <Col span={12}>
                            <Input
                                placeholder="Должность"
                                value={member.position}
                                onChange={(e) => handleMemberChange(index, "position", e.target.value)}
                            />
                        </Col>
                        <Col span={12}>
                            <Input
                                placeholder="ФИО"
                                value={member.name}
                                onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                            />
                        </Col>
                    </Row>
                ))}

                <Form.Item style={{ marginTop: 24 }}>
                    <Button type="primary" onClick={generateDoc}>
                        Сформировать документ
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default WriteOffAct;
