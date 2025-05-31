import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Select, Checkbox, Button, Modal, message, Table, Dropdown, Menu, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { createRoot } from 'react-dom/client';
import '../styles/Cartridges.css';
import dayjs from 'dayjs';

const { Option } = Select;

const CartridgeIssue = () => {
    const [issues, setIssues] = useState([]);
    const [cartridges, setCartridges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form] = Form.useForm(); // Форма AntD
    const [inventoryForm] = Form.useForm(); // Форма для модального окна
    const [inventoryModalVisible, setInventoryModalVisible] = useState(false);
    const [selectedCartridge, setSelectedCartridge] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [editForm] = Form.useForm(); // Форма для редактирования
    const [searchQuery, setSearchQuery] = useState('');
    const [messageApi, contextHolder] = message.useMessage()

    const success_message = (message) => {
        messageApi.open({
            type: 'success',
            content: message,
            duration: 3,
            key: "success_message"
        });
    };

    const loading_message = (message) => {
        messageApi.open({
            type: 'loading',
            content: message,
            duration: 0,
            key: "loading_message",
        });
    };

    const error_message = (message) => {
        messageApi.open({
            type: 'error',
            content: message,
            duration: 3,
            key: "error_message"
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [issuesResponse, cartridgesResponse] = await Promise.all([
                    axios.get('http://localhost:5000/api/cartridge-issues'),
                    axios.get('http://localhost:5000/api/cartridge-inventory'),
                ]);

                if (issuesResponse.data.success) {
                    console.log('Issues data:', issuesResponse.data.data);
                    setIssues(issuesResponse.data.data);
                } else {
                    setError('Не удалось загрузить данные о выдаче.');
                }

                if (cartridgesResponse.data.success) {
                    setCartridges(cartridgesResponse.data.data);
                    if (cartridgesResponse.data.data.length > 0) {
                        form.setFieldsValue({ cartridgeId: cartridgesResponse.data.data[0].id.toString() });
                    }
                } else {
                    setError('Не удалось загрузить список картриджей.');
                }
            } catch (err) {
                setError('Ошибка при загрузке данных. Проверьте сервер.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [form]);

    const filteredIssues = issues.filter(issue =>
        searchQuery
            ? issue.issued_to.toLowerCase().includes(searchQuery.toLowerCase())
            : true
    );

    const handleSubmit = async (values) => {
        try {
            loading_message("Подождите...")
            const response = await axios.post('http://localhost:5000/api/cartridge-issues', {
                issuedTo: values.issuedTo,
                cartridgeId: parseInt(values.cartridgeId),
                oldCartridgeReturned: values.oldCartridgeReturned,
                issueDate: values.issueDate ? values.issueDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'), // Форматируем в YYYY-MM-DD
            });
            if (response.data.success) {
                messageApi.destroy("loading_message")
                success_message(`Запись успешно добавлена! ID: ${response.data.data.id}`)
                form.resetFields();
                if (cartridges.length > 0) {
                    form.setFieldsValue({ cartridgeId: cartridges[0].id.toString(), issueDate: dayjs() });
                }

                // Обновляем список записей
                const issuesResponse = await axios.get('http://localhost:5000/api/cartridge-issues');
                if (issuesResponse.data.success) {
                    setIssues(issuesResponse.data.data);
                }

                // Обновляем список картриджей
                const cartridgesResponse = await axios.get('http://localhost:5000/api/cartridge-inventory');
                if (cartridgesResponse.data.success) {
                    setCartridges(cartridgesResponse.data.data);
                    if (cartridgesResponse.data.data.length > 0) {
                        form.setFieldsValue({ cartridgeId: cartridgesResponse.data.data[0].id.toString(), issueDate: dayjs() });
                    }
                }
            } else {
                error_message(response.data.message || 'Ошибка при добавлении записи.')
            }
        } catch (error) {
            error_message(response.data.message || 'Ошибка при добавлении записи.')
        }
    };

    const openInventoryModal = (cartridge) => {
        setSelectedCartridge(cartridge);
        inventoryForm.setFieldsValue({
            refilledCount: cartridge.refilled_count,
            needsRefillCount: cartridge.needs_refill_count,
        });
        setInventoryModalVisible(true);
    };

    const closeInventoryModal = () => {
        setInventoryModalVisible(false);
        setSelectedCartridge(null);
    };

    const handleInventorySubmit = async (values) => {
        try {
            loading_message("Подождите...")
            const response = await axios.put(
                `http://localhost:5000/api/cartridge-inventory/${selectedCartridge.id}`,
                {
                    refilledCount: values.refilledCount,
                    needsRefillCount: values.needsRefillCount,
                }
            );

            if (response.data.success) {
                messageApi.destroy("loading_message")
                success_message('Остатки успешно обновлены!')
                const cartridgesResponse = await axios.get('http://localhost:5000/api/cartridge-inventory');
                if (cartridgesResponse.data.success) {
                    setCartridges(cartridgesResponse.data.data);
                    if (cartridgesResponse.data.data.length > 0) {
                        form.setFieldsValue({ cartridgeId: cartridgesResponse.data.data[0].id.toString() });
                    }
                }
            } else {
                success_error(response.data.message || 'Ошибка при обновлении остатков.')
            }
        } catch (error) {
            success_error('Ошибка при обновлении остатков. Проверьте сервер.')
            console.error(error);
        }
        closeInventoryModal();
    };

    const openEditModal = (record) => {
        setSelectedIssue(record);
        editForm.setFieldsValue({
            issuedTo: record.issued_to,
            cartridgeId: record.cartridge_id.toString(),
            oldCartridgeReturned: record.old_cartridge_returned,
            issueDate: record.issue_date ? dayjs(record.issue_date) : null, // Преобразуем строку в dayjs
        });
        setEditModalVisible(true);
    };

    const closeEditModal = () => {
        setEditModalVisible(false);
        setSelectedIssue(null);
    };

    const handleEditSubmit = async (values) => {
        try {
            loading_message("Подождите...")
            const response = await axios.put(`http://localhost:5000/api/cartridge-issues/${selectedIssue.id}`, {
                issuedTo: values.issuedTo,
                cartridgeId: parseInt(values.cartridgeId),
                oldCartridgeReturned: values.oldCartridgeReturned || false,
                issueDate: values.issueDate ? values.issueDate.format('YYYY-MM-DD') : selectedIssue.issue_date, // Форматируем в YYYY-MM-DD
            });

            if (response.data.success) {
                messageApi.destroy("loading_message")
                success_message('Запись успешно обновлена!')

                const issuesResponse = await axios.get('http://localhost:5000/api/cartridge-issues');
                if (issuesResponse.data.success) {
                    setIssues(issuesResponse.data.data);
                }

                const cartridgesResponse = await axios.get('http://localhost:5000/api/cartridge-inventory');
                if (cartridgesResponse.data.success) {
                    setCartridges(cartridgesResponse.data.data);
                    if (cartridgesResponse.data.data.length > 0) {
                        form.setFieldsValue({ cartridgeId: cartridgesResponse.data.data[0].id.toString() });
                    }
                }
            } else {
                message_error(response.data.message || 'Ошибка при обновлении записи.')
            }
        } catch (error) {
            message_error(response.data.message || 'Ошибка при обновлении записи.')
            console.error(error);
        }
        closeEditModal();
    };

    const handleDelete = async (id) => {
        try {
            loading_message("Подождите...")
            const response = await axios.delete(`http://localhost:5000/api/cartridge-issues/${id}`);
            if (response.data.success) {
                messageApi.destroy("loading_message")
                success_message('Запись успешно удалена!')

                const issuesResponse = await axios.get('http://localhost:5000/api/cartridge-issues');
                if (issuesResponse.data.success) {
                    setIssues(issuesResponse.data.data);
                }

                const cartridgesResponse = await axios.get('http://localhost:5000/api/cartridge-inventory');
                if (cartridgesResponse.data.success) {
                    setCartridges(cartridgesResponse.data.data);
                    if (cartridgesResponse.data.data.length > 0) {
                        form.setFieldsValue({ cartridgeId: cartridgesResponse.data.data[0].id.toString() });
                    }
                }
            } else {
                message_error(response.data.message || 'Ошибка при удалении записи.')
            }
        } catch (error) {
            message_error(response.data.message || 'Ошибка при удалении записи.')
            console.error(error);
        }
    };

    // Колонки для таблицы записей
    const columns = [
        {
            title: 'Дата',
            dataIndex: 'issue_date',
            key: 'issue_date',
            align: 'center',
            titleAlign: 'center',
            render: (text) => text ? dayjs(text).format('DD.MM.YYYY') : '-', // Форматируем дату без времени
        },
        {
            title: 'Кому выдан',
            dataIndex: 'issued_to',
            key: 'issued_to',
            align: 'center',
            titleAlign: 'center',
        },
        {
            title: 'Картридж',
            dataIndex: 'cartridge_name',
            key: 'cartridge_name',
            align: 'center',
            titleAlign: 'center',
        },
        {
            title: 'Возвращение старого',
            dataIndex: 'old_cartridge_returned',
            key: 'old_cartridge_returned',
            align: 'center',
            titleAlign: 'center',
            render: (text) => {
                // Приводим значение к булевому типу
                const isReturned = text === true || text === 'true' || text === 1 || text === '1' || text === 'yes';
                return isReturned ? 'Да' : 'Нет';
            },
        },
    ];
    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            {contextHolder}
            <div className="form-cartridge-issue">
                <div className="form-header">
                    <h1>Учёт выдачи картриджей</h1>
                    <p>Добавьте новую запись или уточните остатки</p>
                </div>
                <div className="form-card">
                    <div className="form-card-content">
                        <div className="form-issue-form">
                            <Form
                                form={form}
                                onFinish={handleSubmit}
                                layout="vertical"
                            // initialValues={{ oldCartridgeReturned: false }}
                            >
                                <Form.Item
                                    label="Кому выдан"
                                    name="issuedTo"
                                    rules={[{ required: true, message: 'Пожалуйста, укажите, кому выдан картридж!' }]}
                                >
                                    <Input placeholder="Введите имя или отдел" />
                                </Form.Item>
                                <Form.Item
                                    label="Картридж"
                                    name="cartridgeId"
                                    rules={[{ required: true, message: 'Пожалуйста, выберите картридж!' }]}
                                >
                                    <Select placeholder="Выберите картридж">
                                        {cartridges.length === 0 ? (
                                            <Option value="" disabled>
                                                Нет доступных картриджей
                                            </Option>
                                        ) : (
                                            cartridges.map((cartridge) => (
                                                <Option key={cartridge.id} value={cartridge.id.toString()}>
                                                    {cartridge.cartridge_name} (Заправленных: {cartridge.refilled_count})
                                                </Option>
                                            ))
                                        )}
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    label="Дата выдачи"
                                    name="issueDate"
                                    rules={[{ required: true, message: 'Пожалуйста, выберите дату выдачи!' }]}
                                    initialValue={dayjs()} // Устанавливаем текущую дату по умолчанию
                                >
                                    <DatePicker
                                        format="DD.MM.YYYY"
                                        placeholder="Выберите дату"
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                                <Form.Item name="oldCartridgeReturned" valuePropName="checked">
                                    <Checkbox>Возвращён старый картридж</Checkbox>
                                </Form.Item>
                                <Form.Item>
                                    <Button className="form-issue-form-submit-button" type="primary" htmlType="submit">
                                        Добавить запись
                                    </Button>
                                </Form.Item>
                            </Form>
                            <div className="form-issue-actions">
                                <Button
                                    className="form-issue-form-clarification-button"
                                    type="default"
                                    onClick={() => openInventoryModal(cartridges[0])}
                                    disabled={cartridges.length === 0}
                                >
                                    Уточнение остатков
                                </Button>
                            </div>
                        </div>
                        <div className="form-issue-table-and-search">
                            <div className="form-issue-table">
                                {issues.length === 0 ? (
                                    <p>Нет записей.</p>
                                ) : (
                                    <>
                                        <Table
                                            dataSource={filteredIssues} // Используем отфильтрованный список
                                            columns={columns}
                                            rowKey="id"
                                            pagination={false}
                                            scroll={{ x: false }}
                                            onRow={(record) => ({
                                                onContextMenu: (event) => {
                                                    event.preventDefault();
                                                    const menu = (
                                                        <Menu>
                                                            <Menu.Item
                                                                key="edit"
                                                                icon={<EditOutlined />}
                                                                onClick={() => openEditModal(record)}
                                                            >
                                                                Редактировать
                                                            </Menu.Item>
                                                            <Menu.Item
                                                                key="delete"
                                                                icon={<DeleteOutlined />}
                                                                danger
                                                                onClick={() => handleDelete(record.id)}
                                                            >
                                                                Удалить
                                                            </Menu.Item>
                                                        </Menu>
                                                    );
                                                    const dropdown = (
                                                        <Dropdown
                                                            overlay={menu}
                                                            trigger={['contextMenu']}
                                                            visible={true}
                                                            getPopupContainer={() => document.body}
                                                        >
                                                            <div style={{ position: 'absolute', left: event.clientX, top: event.clientY }} />
                                                        </Dropdown>
                                                    );
                                                    const holder = document.createElement('div');
                                                    document.body.appendChild(holder);
                                                    const root = createRoot(holder);
                                                    root.render(dropdown);
                                                    const cleanup = () => {
                                                        root.unmount();
                                                        holder.remove();
                                                    };
                                                    document.addEventListener('click', cleanup, { once: true });
                                                },
                                            })}
                                        />
                                    </>
                                )}
                            </div>
                            <Input
                                placeholder="Поиск по подразделению..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ marginTop: '10px', width: '100%', maxWidth: '300px' }}
                            />
                        </div>
                    </div>
                    <Link to="/" className="form-back-link">
                        ← На главную
                    </Link>
                </div>

                {/* Модальное окно для уточнения остатков */}
                <Modal
                    title={`Уточнить остатки: ${selectedCartridge?.cartridge_name}`}
                    open={inventoryModalVisible}
                    onCancel={closeInventoryModal}
                    footer={null}
                >
                    <Form
                        form={inventoryForm}
                        onFinish={handleInventorySubmit}
                        layout="vertical"
                    >
                        <Form.Item
                            label="Заправленные картриджи"
                            name="refilledCount"
                            rules={[{ required: true, message: 'Пожалуйста, укажите количество!' }]}
                        >
                            <Input type="number" min="0" />
                        </Form.Item>
                        <Form.Item
                            label="Нуждающиеся в заправке"
                            name="needsRefillCount"
                            rules={[{ required: true, message: 'Пожалуйста, укажите количество!' }]}
                        >
                            <Input type="number" min="0" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                                Сохранить
                            </Button>
                            <Button onClick={closeInventoryModal}>Отмена</Button>
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal
                    title="Редактировать запись"
                    open={editModalVisible}
                    onCancel={closeEditModal}
                    footer={null}
                >
                    <Form
                        form={editForm}
                        onFinish={handleEditSubmit}
                        layout="vertical"
                        initialValues={{ oldCartridgeReturned: false }}
                    >
                        <Form.Item
                            label="Дата выдачи"
                            name="issueDate"
                            rules={[{ required: true, message: 'Пожалуйста, выберите дату выдачи!' }]}
                        >
                            <DatePicker
                                format="DD.MM.YYYY" // Формат отображения для пользователя
                                placeholder="Выберите дату"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Кому выдан"
                            name="issuedTo"
                            rules={[{ required: true, message: 'Пожалуйста, укажите, кому выдан картридж!' }]}
                        >
                            <Input placeholder="Введите имя или отдел" />
                        </Form.Item>
                        <Form.Item
                            label="Картридж"
                            name="cartridgeId"
                            rules={[{ required: true, message: 'Пожалуйста, выберите картридж!' }]}
                        >
                            <Select placeholder="Выберите картридж">
                                {cartridges.length === 0 ? (
                                    <Option value="" disabled>
                                        Нет доступных картриджей
                                    </Option>
                                ) : (
                                    cartridges.map((cartridge) => (
                                        <Option key={cartridge.id} value={cartridge.id.toString()}>
                                            {cartridge.cartridge_name} (Заправленных: {cartridge.refilled_count})
                                        </Option>
                                    ))
                                )}
                            </Select>
                        </Form.Item>
                        <Form.Item name="oldCartridgeReturned" valuePropName="checked">
                            <Checkbox>Возвращён старый картридж</Checkbox>
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                                Сохранить
                            </Button>
                            <Button onClick={closeEditModal}>Отмена</Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </>
    );
};

export default CartridgeIssue;