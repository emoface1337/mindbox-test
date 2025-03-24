import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoApp from '../App.tsx';

describe('TodoApp', () => {
  // Рендеринг начального состояния
  test('Рендеринг начального состояния', () => {
    render(<TodoApp />);

    expect(screen.getByText('Заметки')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Что нужно сделать?')
    ).toBeInTheDocument();
    expect(screen.getByText('Тестовое задание')).toBeInTheDocument();
    expect(screen.getByText('Прекрасный код')).toBeInTheDocument();
    expect(screen.getByText('Покрытие тестами')).toBeInTheDocument();
    expect(screen.getByText('2 осталось')).toBeInTheDocument();
  });

  // Добавление новой задачи
  test('Добавление новой задачи', async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    const input = screen.getByPlaceholderText('Что нужно сделать?');
    await user.type(input, 'Новая задача{enter}');

    expect(screen.getByText('Новая задача')).toBeInTheDocument();
    expect(screen.getByText('3 осталось')).toBeInTheDocument();
  });

  // Переключение статуса задачи
  test('Переключение статуса задачи', () => {
    render(<TodoApp />);

    const todoItem = screen.getByText('Тестовое задание');
    fireEvent.click(todoItem);

    expect(todoItem).toHaveStyle('text-decoration: line-through');
    expect(screen.getByText('1 осталось')).toBeInTheDocument();
  });

  // Фильтрация задач
  test('Фильтрация задач', () => {
    render(<TodoApp />);

    // Проверяем активные
    fireEvent.click(screen.getByText('Активные'));
    expect(screen.getByText('Тестовое задание')).toBeInTheDocument();
    expect(screen.getByText('Покрытие тестами')).toBeInTheDocument();
    expect(screen.queryByText('Прекрасный код')).not.toBeInTheDocument();

    // Проверяем завершённые
    fireEvent.click(screen.getByText('Завершённые'));
    expect(screen.getByText('Прекрасный код')).toBeInTheDocument();
    expect(screen.queryByText('Тестовое задание')).not.toBeInTheDocument();
  });

  // Автоматическое переключение фильтра
  test('Автоматическое переключение фильтра', () => {
    render(<TodoApp />);

    // Переключаемся на завершённые
    fireEvent.click(screen.getByText('Завершённые'));
    expect(screen.getByText('Прекрасный код')).toBeInTheDocument();

    // Кликаем по завершённой задаче, чтобы сделать её активной
    fireEvent.click(screen.getByText('Прекрасный код'));

    // Проверяем, что фильтр автоматически переключился на 'все'
    expect(screen.getByText('Все')).toHaveStyle('border: 1px solid #eee');
    expect(screen.getByText('Тестовое задание')).toBeInTheDocument();
    expect(screen.getByText('Покрытие тестами')).toBeInTheDocument();
    expect(screen.getByText('Прекрасный код')).toBeInTheDocument();
  });

  // Очистка завершённых задач
  test('Очистка завершённых задач', () => {
    render(<TodoApp />);

    fireEvent.click(screen.getByText('Очистить завершённые'));

    expect(screen.queryByText('Прекрасный код')).not.toBeInTheDocument();
    expect(screen.getByText('2 осталось')).toBeInTheDocument();
  });

  // Не добавляет пустые задачи
  test('Не добавляет пустые задачи', async () => {
    const user = userEvent.setup();
    render(<TodoApp />);

    const input = screen.getByPlaceholderText('Что нужно сделать?');
    await user.type(input, '{enter}');

    const todos = screen.getAllByRole('listitem');
    expect(todos.length).toBe(3); // Остаётся 3 начальные задачи
  });
});
