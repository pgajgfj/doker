import {useEffect, useState} from 'react';
import {Form, Input, Button, Modal, Upload, UploadFile, Space, InputNumber, Select} from 'antd';
import {useNavigate, Link} from 'react-router-dom';
import {RcFile, UploadChangeParam} from "antd/es/upload";
import {PlusOutlined} from '@ant-design/icons';
import {IProductCreate, IProductImageDesc} from '../../../interfaces/products';
import {http_common} from "../../../env";
import {ICategoryItem} from "../../home/types.ts";
import EditorTiny from "../../common/EditorTiny";

// import Loader from '../../common/loader/Loader';

export interface ICategoryName {
    id: number;
    name: string;
}

const ProductCreatePage = () => {

    const navigate = useNavigate();
    const [form] = Form.useForm<IProductCreate>();
    // const [loading, setLoading] = useState<boolean>(false);

    const [categories, setCategories] = useState<ICategoryName[]>([]);
    const [description, setDescription] = useState<string>("");
    const [descImages, setDescImages] = useState<IProductImageDesc[]>([]);
    const [previewOpen, setPreviewOpen] = useState<boolean>(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    useEffect(() => {
        http_common.get<ICategoryItem[]>("/api/Categories")
            .then(resp => {
                setCategories(resp.data);
            });
    }, []);

    const onSubmit = async (values: IProductCreate) => {
        // setLoading(true);
        try {
            console.log("Send Data:", values);
            console.log("descImages list:", descImages);
            const imagesDescIds = descImages.map((x) => {
                return x.id;
            })
            const productData = { ...values, description, imagesDescIds };
            http_common.post("/api/Products", productData,
                {
                    headers: { "Content-Type": "multipart/form-data" }
                }).then(resp => {
                console.log("Product created:", resp.data);
                navigate(`/products`);
            });

        } catch (error) {
            console.error("Error creating product:", error);
        } finally {
            // setLoading(false);
        }
    };

    return (

        <>
            <p className="text-center text-3xl font-bold mb-7">Create Product</p>
            <Form form={form} onFinish={onSubmit} labelCol={{span: 6}} wrapperCol={{span: 14}}>
                <Form.Item name="name" label="Name" hasFeedback
                           rules={[{required: true, message: 'Please provide a valid category name.'}]}>
                    <Input placeholder='Type category name'/>
                </Form.Item>

                <Form.Item name="price" label="Price" hasFeedback
                           rules={[{required: true, message: 'Please enter product price.'}]}>
                    <InputNumber addonAfter="$" placeholder='0.00'/>
                </Form.Item>

                <Form.Item name="categoryId" label="Category" hasFeedback
                           rules={[{required: true, message: 'Please choose the category.'}]}>
                    <Select placeholder="Select a category">
                        {categories.map(c => (
                            <Select.Option key={c.id} value={c.id}> {c.name}</Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item name="images" label="Photo" valuePropName="Image"
                           rules={[{required: true, message: "Please choose a photo for the product."}]}
                           getValueFromEvent={(e: UploadChangeParam) => {
                               return e?.fileList.map(file => file.originFileObj);
                           }}>

                    <Upload beforeUpload={() => false} accept="image/*" maxCount={10} listType="picture-card" multiple
                            onPreview={(file: UploadFile) => {
                                if (!file.url && !file.preview) {
                                    file.preview = URL.createObjectURL(file.originFileObj as RcFile);
                                }

                                setPreviewImage(file.url || (file.preview as string));
                                setPreviewOpen(true);
                                setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
                            }}>

                        <div>
                            <PlusOutlined/>
                            <div style={{marginTop: 8}}>Upload</div>
                        </div>
                    </Upload>
                </Form.Item>

                <EditorTiny
                    value={description} //Значення, яке ми вводимо в поле
                    label="Опис" //Підпис для даного інпуту
                    field="description" //Назва інпуту
                    getSelectImage={(image: IProductImageDesc) => {
                        setDescImages((prevImages) => [...prevImages, image]);
                    }}
                    onEditorChange={(text: string) => {
                        //Метод, який викликає сам компонет, коли в інпуті змінюється значення
                        //console.log("Data set value", text);
                        setDescription(text); //Текст, який в середині інпуту, записуємо у формік в поле description
                    }}
                />

                <Form.Item wrapperCol={{span: 10, offset: 10}}>
                    <Space>
                        <Link to={"/products"}>
                            <Button htmlType="button"
                                    className='text-white bg-gradient-to-br from-red-400 to-purple-600 font-medium rounded-lg px-5'>Cancel</Button>
                        </Link>
                        <Button htmlType="submit"
                                className='text-white bg-gradient-to-br from-green-400 to-blue-600 font-medium rounded-lg px-5'>Create</Button>
                    </Space>
                </Form.Item>
            </Form>

            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)}>
                <img alt="example" style={{width: '100%'}} src={previewImage}/>
            </Modal>
        </>

    );
};

export default ProductCreatePage;
