import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test">
        <p>Content</p>
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders dialog, title and children when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Settings">
        <p>Modal content here</p>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Modal content here')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Settings">
        <p>Content</p>
      </Modal>
    );
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Settings">
        <p>Content</p>
      </Modal>
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
