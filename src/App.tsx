import {
  FC,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { v4 as uuidv4 } from 'uuid';

import './styles/reset.css';

const GlobalStyle = createGlobalStyle`
    body {
        font-family: Consolas, sans-serif;
        background: #f5f5f5;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    #root {
        width: 100%;
        height: 100%;
    }
`;

const Container = styled.div`
  background: white;
  width: 100%;
  height: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TodoContainer = styled.div`
  background: white;
  width: max-content;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: auto;
  height: auto;
  max-height: calc(100dvh - 200px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 24px;
  color: #e6e6e6;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: none;
  border-bottom: 1px solid #eee;
  font-size: 16px;
  outline: none;
  font-family: inherit;
`;

const TodoListContainer = styled.div`
  overflow-y: auto;
  height: 100%;
  scrollbar-width: thin;
  scrollbar-color: rgb(225, 225, 225) transparent;

  ::-webkit-scrollbar {
    width: 4px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgb(225, 225, 225);
    border-radius: 100px;
  }
`;

const TodoList = styled.ul`
  list-style: none;
  padding: 0;
  overflow: hidden;
  height: 100%;
`;

const TodoItem = styled.li<{ $completed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
  text-decoration: ${({ $completed }) =>
    $completed ? 'line-through' : 'none'};
  color: ${({ $completed }) => ($completed ? '#ccc' : '#333')};
  cursor: pointer;

  > label {
    width: 100%;
    cursor: inherit;
  }
`;

const Checkbox = styled.input`
  margin-right: 10px;
  cursor: inherit;
`;

const Footer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  flex-wrap: nowrap;
  gap: 10px;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-family: inherit;
  background: white;
  border: ${({ $active }) => ($active ? '1px solid #eee' : 'none')};

  &:disabled {
    pointer-events: none;
  }
`;

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const TodoApp: FC = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: uuidv4(), text: 'Тестовое задание', completed: false },
    { id: uuidv4(), text: 'Прекрасный код', completed: true },
    { id: uuidv4(), text: 'Покрытие тестами', completed: false },
  ]);

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [newTodo, setNewTodo] = useState('');

  const addTodo = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && newTodo.trim()) {
        setTodos((prev) => [
          ...prev,
          { id: uuidv4(), text: newTodo, completed: false },
        ]);
        setNewTodo('');
      }
    },
    [newTodo]
  );

  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  }, []);

  const activeTodosCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos]
  );

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos]
  );

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  // Автоматически переключаем фильтр, если на текущем фильтре не осталось задач
  useEffect(() => {
    if (filter === 'completed' || filter === 'active') {
      const shouldSwitch =
        filter === 'completed'
          ? !todos.some((todo) => todo.completed)
          : !todos.some((todo) => !todo.completed);

      if (shouldSwitch) {
        setFilter('all');
      }
    }
  }, [todos, filter]);

  return (
    <>
      <GlobalStyle />
      <Container>
        <TodoContainer>
          <Title>Заметки</Title>
          <Input
            placeholder="Что нужно сделать?"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={addTodo}
          />
          <TodoListContainer>
            <TodoList>
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  $completed={todo.completed}
                  onClick={() => toggleTodo(todo.id)}
                >
                  <Checkbox
                    type="checkbox"
                    checked={todo.completed}
                    readOnly={true}
                  />
                  {todo.text}
                </TodoItem>
              ))}
            </TodoList>
          </TodoListContainer>
          <Footer>
            <span>{activeTodosCount} осталось</span>
            <div>
              <FilterButton
                $active={filter === 'all'}
                onClick={() => setFilter('all')}
              >
                Все
              </FilterButton>
              <FilterButton
                $active={filter === 'active'}
                onClick={() => setFilter('active')}
                disabled={activeTodosCount === 0}
              >
                Активные
              </FilterButton>
              <FilterButton
                $active={filter === 'completed'}
                onClick={() => setFilter('completed')}
                disabled={completedCount === 0}
              >
                Завершённые
              </FilterButton>
            </div>
            {
              <FilterButton
                onClick={clearCompleted}
                disabled={completedCount === 0}
              >
                Очистить завершённые
              </FilterButton>
            }
          </Footer>
        </TodoContainer>
      </Container>
    </>
  );
};

export default TodoApp;
