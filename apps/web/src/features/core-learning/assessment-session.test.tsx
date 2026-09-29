import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AssessmentSession } from './assessment-session';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const question = {
  questionInstanceId: 'question-1',
  stem: 'Berapakah $2+3$?',
  options: [
    { id: 'A', text: '5' },
    { id: 'B', text: '6' },
  ],
  selectedOptionId: null,
};

function mount(
  onSave: (
    questionId: string,
    optionId: string | null,
  ) => Promise<{ questionInstanceId: string; selectedOptionId: string | null }>,
) {
  const onSubmit = vi.fn().mockResolvedValue({});
  const onSubmitted = vi.fn();
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <AssessmentSession
        title="Level 1"
        questions={[question]}
        submitLabel="Kirim Drill"
        confirmMessage={(empty) => `${empty} kosong`}
        onSave={onSave}
        onSubmit={onSubmit}
        onSubmitted={onSubmitted}
      />
    </QueryClientProvider>,
  );
  return { onSubmit, onSubmitted };
}

describe('sesi asesmen', () => {
  it('menyimpan jawaban sebelum mengizinkan submit', async () => {
    const onSave = vi
      .fn()
      .mockResolvedValue({ questionInstanceId: 'question-1', selectedOptionId: 'A' });
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { onSubmit } = mount(onSave);

    fireEvent.click(screen.getByRole('radio', { name: /^A\./ }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith('question-1', 'A'));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Kirim Drill' }).hasAttribute('disabled')).toBe(
        false,
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Kirim Drill' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(confirm).toHaveBeenCalledWith('0 kosong');
  });

  it('menahan submit setelah simpan gagal dan membuka kembali setelah retry', async () => {
    const onSave = vi
      .fn()
      .mockRejectedValueOnce(new Error('Jaringan putus'))
      .mockResolvedValueOnce({ questionInstanceId: 'question-1', selectedOptionId: 'A' });
    const { onSubmit } = mount(onSave);

    fireEvent.click(screen.getByRole('radio', { name: /^A\./ }));
    await screen.findByText('Jaringan putus');
    expect(screen.getByRole('button', { name: 'Kirim Drill' }).hasAttribute('disabled')).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Coba simpan lagi' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Kirim Drill' }).hasAttribute('disabled')).toBe(
        false,
      ),
    );
    expect(onSave).toHaveBeenCalledTimes(2);
  });
});
