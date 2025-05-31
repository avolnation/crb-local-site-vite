import React, { useEffect, useState } from 'react';
import { Input, Button, Table, Modal, Form, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const BarcodeApp = () => {
    const [barcode, setBarcode] = useState('');
    const [barcodes, setBarcodes] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newBarcodeName, setNewBarcodeName] = useState('');
    const [currentQuantity, setCurrentQuantity] = useState(0);
    const [currentBarcode, setCurrentBarcode] = useState('');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editRecord, setEditRecord] = useState(null);

    const success_message = (msg) => {
        messageApi.open({ type: 'success', content: msg, duration: 3, key: "success_message" });
    };

    const error_message = (msg) => {
        messageApi.open({ type: 'error', content: msg, duration: 3, key: "error_message" });
    };

    useEffect(() => {
        fetch('http://192.168.100.75:5000/api/barcodes?method=all_barcodes')
            .then((response) => response.json())
            .then((data) => setBarcodes(data.data))
            .catch((error) => console.error('Ошибка при получении данных:', error));
    }, []);

    const handleCheckBarcode = () => {
        fetch(`http://192.168.100.75:5000/api/barcodes?barcode=${barcode}&method=check_barcode`)
            .then((response) => response.json())
            .then((data) => {
                if (!data.found) {
                    setCurrentBarcode(barcode);
                    setIsModalVisible(true);
                }
            })
            .catch((error) => {
                console.error('Ошибка при проверке штрихкода:', error);
                alert('Ошибка при проверке штрихкода');
            });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditModalVisible(false);
    };

    const handleOk = () => {
        fetch('http://192.168.100.75:5000/api/add-barcode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode: currentBarcode, name: newBarcodeName, quantity: currentQuantity }),
        })
            .then((response) => response.json())
            .then(() => {
                setBarcodes([...barcodes, { code: currentBarcode, name: newBarcodeName, quantity: currentQuantity }]);
                setIsModalVisible(false);
                setNewBarcodeName('');
                setCurrentQuantity(0);
                success_message('Штрихкод добавлен!');
            })
            .catch((error) => {
                console.error('Ошибка при добавлении штрихкода:', error);
                error_message('Ошибка при добавлении штрихкода');
            });
    };

    const handleEdit = (record) => {
        setEditRecord(record);
        setNewBarcodeName(record.name);
        setCurrentQuantity(record.quantity);
        setEditModalVisible(true);
    };

    const handleDelete = (record) => {
        fetch(`http://192.168.100.75:5000/api/delete-barcode?id=${record.id}`, {
            method: 'DELETE'
        })
            .then(() => {
                setBarcodes(barcodes.filter(b => b.id !== record.id));
                success_message('Штрихкод удален!');
            })
            .catch(() => error_message('Ошибка при удалении штрихкода'));
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Штрихкод', dataIndex: 'code', key: 'code' },
        { title: 'Наименование', dataIndex: 'name', key: 'name' },
        { title: 'Количество', dataIndex: 'quantity', key: 'quantity' },
        {
            title: 'Действия',
            key: 'action',
            render: (_, record) => (
                <span>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record)}
                    />
                </span>
            )
        }
    ];

    return (
        <div>
            {contextHolder}
            <h2>Проверка и добавление штрихкодов</h2>

            <Input
                placeholder="Введите штрихкод"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onPressEnter={handleCheckBarcode}
                style={{ width: 200, marginBottom: 20 }}
            />

            <Button onClick={handleCheckBarcode} type="primary" style={{ marginLeft: 10 }}>
                Проверить
            </Button>

            <h2 style={{ marginTop: 20 }}>Список штрихкодов</h2>
            <Table dataSource={barcodes} columns={columns} rowKey="id" />

            <Modal title="Добавить штрихкод" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Form layout="vertical">
                    <Form.Item label="Наименование штрихкода">
                        <Input value={newBarcodeName} onChange={(e) => setNewBarcodeName(e.target.value)} />
                    </Form.Item>
                    <Form.Item label="Количество">
                        <Input type="number" value={currentQuantity} onChange={(e) => setCurrentQuantity(Number(e.target.value))} />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal title="Редактировать штрихкод"
                open={editModalVisible}
                // onOk={handleUpdate}
                onCancel={handleCancel}>
                <Form layout="vertical">
                    <Form.Item label="Наименование">
                        <Input value={newBarcodeName} onChange={(e) => setNewBarcodeName(e.target.value)} />
                    </Form.Item>
                    <Form.Item label="Количество">
                        <Input type="number" value={currentQuantity} onChange={(e) => setCurrentQuantity(Number(e.target.value))} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BarcodeApp;
