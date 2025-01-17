import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "src/page/list/TodoList.module.css";
import Header from "src/layout/header/Header";
import Search from "src/components/list/Search";
import _ from 'lodash';


interface TodoItem {
    _id: number;
    title: string;
    content: string;
    done: boolean;
    createdAt: string;
    updatedAt: string;
}



const TodoList = (): JSX.Element => {
    const BASE_URL: string | undefined = process.env.REACT_APP_PORT_NUMBER;
    const [todoList, setTodoList] = useState<TodoItem[]>([]);
    const [filterTodoList, setFilterTodoList] = useState<TodoItem[]>([]);
    const navigate = useNavigate();

    const getTodoList = async (): Promise<void> => {
        try {
            const response = 
            await axios.get<TodoListResponse>(
                `${BASE_URL}/api/todolist`
            );

            if (response.status === 200) {
                const todoListData: TodoItem[] = response.data.items;

                setTodoList(todoListData);
                return;
            }
        } catch (error) {
            console.log(error);
        }
    };


    const onChangeCheckBox = async (todoId: number): Promise<void> => {
        try {
            const todo: TodoItem | undefined = todoList.find(
                (todo: TodoItem) => {
                    return todo._id === todoId;
                }
            );

            const updateTodoDone: boolean = !todo?.done;

            const response = await axios.patch<AxiosResponse>(
                `${BASE_URL}/api/todoList/${todoId}`,
                {
                    done: updateTodoDone,
                }
            );

            if (response.status === 200) {
                await getTodoList();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const onClickDeleteTodo = async (todoId: number): Promise<void> => {
        try {
            if (window.confirm("정말로 삭제하시겠습니까?")) {
                const response = await axios.delete<AxiosResponse>(
                    `${BASE_URL}/api/todoList/${todoId}`
                );

                if (response.status === 200) {
                    await getTodoList();
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    // 300ms 동안 추가 입력이 없을 때 실행
    const debouncedGetTodoList = _.debounce(getTodoList, 300);

    const onChangeTodoSearch =  (event: React.ChangeEvent<HTMLInputElement>):void => {
        //setUserInputValue(event.target.value);
        debouncedGetTodoList();
        const userInputValue = event.target.value;
        const filterTodo: TodoItem[] = todoList.filter((todo: TodoItem) => {
            return todo.title.toLowerCase().includes(userInputValue.toLowerCase());
        });

        setFilterTodoList(filterTodo);
    }

    const renderTodoList = (): JSX.Element[] => {
        const todos: TodoItem[] = 
        filterTodoList.length > 0 ? filterTodoList : todoList;

        return todos?.map((todo: TodoItem) => {
            const TODO_ID: number = todo._id;

            return (
                <li key={TODO_ID} className={styles.link}>
                    <input
                        key={TODO_ID}
                        type="checkbox"
                        checked={todo.done}
                        className={styles.input}
                        onChange={() => {
                            onChangeCheckBox(TODO_ID);
                        }}
                    />
                    <h3
                        className={
                            todo.done
                                ? `${styles.title} 
                                ${styles.checked}`
                                : styles.title
                        }
                        onClick={() =>
                            navigate(`/detail/${TODO_ID}`)
                        }
                    >
                        {todo.title}
                    </h3>
                    <FontAwesomeIcon
                        icon={faTrashCan}
                        className={styles.faTrashCan}
                        onClick={() => onClickDeleteTodo(TODO_ID)}
                    />
                </li>
            );
        })
    }

    useEffect(() => {
        getTodoList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Header title={"List"} />
            <Search 
            onChangeTodoSearch = { onChangeTodoSearch } />
            <div className={styles.content}>
                <ul>
                    { renderTodoList() }
                </ul>
                <button
                    className={styles.button}
                    onClick={() => navigate("/regist")}
                >
                    +
                </button>
            </div>
        </>
    );
};

export default TodoList;
