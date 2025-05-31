import { useState } from "react";
import { saveAs } from "file-saver";
import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    AlignmentType,
} from "docx";

import moment from 'moment'
import 'moment/dist/locale/ru'


const WriteOffAct = () => {
    const [department, setDepartment] = useState("");
    const [date, setDate] = useState("");
    const [members, setMembers] = useState(["", "", ""]);
    const [accountablePerson, setAccountablePerson] = useState("");
    const [materials, setMaterials] = useState([
        { name: "", quantity: "", price: "", total: "", note: "" },
    ]);

    const generateDoc = async () => {
        // Ensure at least 11 rows in the table
        const minRows = 10;
        let tableData = [...materials];

        // If fewer than 11 rows, add empty rows to reach 11
        if (materials.length < minRows) {
            const emptyRows = Array(minRows - materials.length).fill({
                name: "",
                quantity: "",
                price: "",
                total: "",
                note: "",
            });
            tableData = [...materials, ...emptyRows];
        }

        const tableRows = [
            new TableRow({
                children: [
                    "№ п/п",
                    "Наименование материала",
                    "Кол-во",
                    "Цена",
                    "Сумма",
                    "Примечание",
                ].map(
                    (text) =>
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [new TextRun({ text, bold: true })],
                                    alignment: AlignmentType.CENTER,
                                    size: 24,
                                }),
                            ],

                        })
                ),
            }),
            ...tableData.map((mat, idx) =>
                new TableRow({
                    children: [
                        `${idx + 1}`, // Row number always increments
                        mat.name,
                        mat.quantity,
                        mat.price,
                        mat.total,
                        mat.note,
                    ].map(
                        (text) =>
                            new TableCell({
                                children: [new Paragraph({ text, alignment: AlignmentType.CENTER })],
                            })
                    ),
                })
            ),
        ];

        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: {
                            size: 28,
                        }
                    }
                }
            },
            sections: [
                {
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "УЗ «Буда-Кошелевская ЦРБ»",
                                    bold: true,
                                }),
                            ],
                            alignment: AlignmentType.LEFT,
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "УТВЕРЖДАЮ:			",
                                }),
                            ],
                            alignment: AlignmentType.RIGHT,
                        }),
                        new Paragraph({
                            text: "_________________________",
                            alignment: AlignmentType.RIGHT,
                            spacing: { before: 100 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "подпись, Ф.И.О..		",
                                    italics: true,
                                    size: 20,
                                }),
                            ],
                            alignment: AlignmentType.RIGHT,
                        }),
                        new Paragraph({
                            text: "«__» __________ 20__ г.	",
                            alignment: AlignmentType.RIGHT,
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "АКТ",
                                    bold: true,
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "О СПИСАНИИ МАТЕРИАЛОВ",
                                    bold: true,
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            text: `за ${moment(Date.parse(date)).locale('ru').format('LL').toString()}`,
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 400 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Мы, нижеподписавшиеся, комиссия в составе:",
                                }),
                            ],
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "________________________________________________________________",
                                }),
                            ],

                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "должность, Ф.И.О.",
                                    italics: true,
                                    size: 20,
                                }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),

                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "________________________________________________________________",
                                }),
                            ],
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "________________________________________________________________",
                                }),
                            ],
                        }),

                        new Paragraph({
                            text: `Составили настоящий акт на списание следующих материалов в отделении: ______________________________________________________`,
                            spacing: { before: 200, after: 200 },
                        }),
                        new Table({
                            rows: tableRows,
                            width: {
                                size: 100,
                                type: "pct",
                            },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "Акт составлен для снятия с подотчета ",
                                }),
                                new TextRun({
                                    text: "заведующего сектором АСУ, Кутукина А.С.",
                                    italics: true,
                                    bold: true
                                }),
                            ],
                            spacing: { before: 200 },
                        }),
                        new Paragraph({
                            text: "Комиссия: ",
                            spacing: { before: 400 },
                        }),
                        new Paragraph({
                            text: "_______________		_______________		________________________",
                            spacing: { before: 200 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "          должность			 подпись				Ф.И.О.",
                                    italics: true,
                                    size: 20,
                                }),
                            ],
                            spacing: { after: 200 },
                        }),
                        new Paragraph({
                            text: "_______________		_______________		________________________",
                            spacing: { before: 200 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "          должность			 подпись				Ф.И.О.",
                                    italics: true,
                                    size: 20,
                                }),
                            ],
                        }),
                        new Paragraph({
                            text: "_______________		_______________		________________________",
                            spacing: { before: 200 },
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: "          должность			 подпись				Ф.И.О.",
                                    italics: true,
                                    size: 20,
                                }),
                            ],
                        }),
                    ],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, "akt-spisaniya.docx");
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Акт на списание материалов</h1>
            <input
                className="border p-2 w-full"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />
            <div>
                <p className="font-semibold">Материалы:</p>
                {materials.map((mat, idx) => (
                    <div key={idx} className="grid grid-cols-6 gap-2 mb-2">
                        {Object.keys(mat).map((key) => (
                            <input
                                key={key}
                                className="border p-2"
                                placeholder={
                                    key === "name"
                                        ? "Наименование"
                                        : key === "quantity"
                                            ? "Кол-во"
                                            : key === "price"
                                                ? "Цена"
                                                : key === "total"
                                                    ? "Сумма"
                                                    : "Примечание"
                                }
                                value={mat[key]}
                                onChange={(e) => {
                                    const newMaterials = [...materials];
                                    newMaterials[idx][key] = e.target.value;
                                    setMaterials(newMaterials);
                                }}
                            />
                        ))}
                    </div>
                ))}
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() =>
                        setMaterials([
                            ...materials,
                            { name: "", quantity: "", price: "", total: "", note: "" },
                        ])
                    }
                >
                    + Добавить материал
                </button>
            </div>
            <button
                className="bg-green-600 text-white px-6 py-2 rounded text-lg"
                onClick={generateDoc}
            >
                Сформировать документ
            </button>
        </div>
    );
};

export default WriteOffAct;