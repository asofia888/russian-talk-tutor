import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConversationCard from './ConversationCard';
import { ConversationLine } from '../types';
import { AudioProvider } from '../contexts/AudioContext';
import React from 'react';

vi.mock('./WordChip', () => ({
  default: ({ word }: any) => <div data-testid="word-chip">{word.russian}</div>,
}));

vi.mock('./GrammarModal', () => ({
  default: ({ grammarPoint, onClose }: any) => (
    <div data-testid="grammar-modal">
      <button onClick={onClose}>Close</button>
      {grammarPoint.title}
    </div>
  ),
}));

vi.mock('./CaseDrillModal', () => ({
  default: ({ word, onClose }: any) => (
    <div data-testid="case-drill-modal">
      <button onClick={onClose}>Close</button>
      {word.russian}
    </div>
  ),
}));

describe('ConversationCard', () => {
  const mockLine: ConversationLine = {
    speaker: 'A',
    russian: 'Привет',
    pronunciation: 'Privet',
    japanese: 'こんにちは',
    words: [
      {
        russian: 'Привет',
        pronunciation: 'Privet',
        japanese: 'こんにちは',
      },
    ],
  };

  const mockLineWithGrammar: ConversationLine = {
    ...mockLine,
    grammarPoint: {
      title: 'Greeting patterns',
      explanation: 'Basic greetings in Russian',
      examples: [
        {
          russian: 'Здравствуйте',
          pronunciation: 'Zdravstvuyte',
          japanese: 'こんにちは（丁寧）',
        },
      ],
    },
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AudioProvider>{children}</AudioProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render conversation line correctly', () => {
    render(<ConversationCard line={mockLine} isListeningMode={false} />, { wrapper });

    expect(screen.getByText('A')).toBeInTheDocument();
    // Use getAllByText for text that appears multiple times (in main and word chips)
    expect(screen.getAllByText('Привет')[0]).toBeInTheDocument();
    expect(screen.getByText('Privet')).toBeInTheDocument();
    // Japanese text appears in both translation and word chip
    expect(screen.getAllByText('こんにちは')[0]).toBeInTheDocument();
  });

  it('should render all words in the line', () => {
    render(<ConversationCard line={mockLine} isListeningMode={false} />, { wrapper });

    const wordChips = screen.getAllByTestId('word-chip');
    expect(wordChips).toHaveLength(1);
  });

  it('should show play button', () => {
    render(<ConversationCard line={mockLine} isListeningMode={false} />, { wrapper });

    const playButton = screen.getByLabelText('「Привет」を再生');
    expect(playButton).toBeInTheDocument();
  });

  it('should show grammar button when grammarPoint exists', () => {
    render(<ConversationCard line={mockLineWithGrammar} isListeningMode={false} />, {
      wrapper,
    });

    const grammarButton = screen.getByLabelText('文法解説を見る');
    expect(grammarButton).toBeInTheDocument();
  });

  it('should not show grammar button when grammarPoint is absent', () => {
    render(<ConversationCard line={mockLine} isListeningMode={false} />, { wrapper });

    const grammarButton = screen.queryByLabelText('文法解説を見る');
    expect(grammarButton).not.toBeInTheDocument();
  });

  it('should open grammar modal when grammar button is clicked', () => {
    render(<ConversationCard line={mockLineWithGrammar} isListeningMode={false} />, {
      wrapper,
    });

    const grammarButton = screen.getByLabelText('文法解説を見る');
    fireEvent.click(grammarButton);

    expect(screen.getByTestId('grammar-modal')).toBeInTheDocument();
    expect(screen.getByText('Greeting patterns')).toBeInTheDocument();
  });

  it('should close grammar modal when close is clicked', () => {
    render(<ConversationCard line={mockLineWithGrammar} isListeningMode={false} />, {
      wrapper,
    });

    const grammarButton = screen.getByLabelText('文法解説を見る');
    fireEvent.click(grammarButton);

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('grammar-modal')).not.toBeInTheDocument();
  });

  it('should show translation by default when not in listening mode', () => {
    render(<ConversationCard line={mockLine} isListeningMode={false} />, { wrapper });

    expect(screen.getByText('こんにちは')).toBeInTheDocument();
    expect(screen.queryByText('訳を表示')).not.toBeInTheDocument();
  });

  it('should hide translation initially in listening mode', () => {
    render(<ConversationCard line={mockLine} isListeningMode={true} />, { wrapper });

    expect(screen.queryByText('こんにちは')).not.toBeInTheDocument();
    expect(screen.getByText('訳を表示')).toBeInTheDocument();
  });

  it('should show translation when clicked in listening mode', () => {
    render(<ConversationCard line={mockLine} isListeningMode={true} />, { wrapper });

    const showButton = screen.getByText('訳を表示');
    fireEvent.click(showButton);

    expect(screen.getByText('こんにちは')).toBeInTheDocument();
    expect(screen.getByText('訳を隠す')).toBeInTheDocument();
  });

  it('should hide translation when hide button is clicked in listening mode', () => {
    render(<ConversationCard line={mockLine} isListeningMode={true} />, { wrapper });

    // Show translation
    const showButton = screen.getByText('訳を表示');
    fireEvent.click(showButton);

    // Hide translation
    const hideButton = screen.getByText('訳を隠す');
    fireEvent.click(hideButton);

    expect(screen.queryByText('こんにちは')).not.toBeInTheDocument();
    expect(screen.getByText('訳を表示')).toBeInTheDocument();
  });

  it('should reset translation visibility when listening mode changes', () => {
    const { rerender } = render(
      <ConversationCard line={mockLine} isListeningMode={true} />,
      { wrapper }
    );

    // Show translation
    const showButton = screen.getByText('訳を表示');
    fireEvent.click(showButton);
    expect(screen.getByText('こんにちは')).toBeInTheDocument();

    // Toggle listening mode off
    rerender(
      <AudioProvider>
        <ConversationCard line={mockLine} isListeningMode={false} />
      </AudioProvider>
    );

    // Translation should be visible (not in listening mode)
    expect(screen.getByText('こんにちは')).toBeInTheDocument();

    // Toggle listening mode on again
    rerender(
      <AudioProvider>
        <ConversationCard line={mockLine} isListeningMode={true} />
      </AudioProvider>
    );

    // Translation should be hidden again
    expect(screen.queryByText('こんにちは')).not.toBeInTheDocument();
    expect(screen.getByText('訳を表示')).toBeInTheDocument();
  });

  it('should render with multiple words', () => {
    const lineWithMultipleWords: ConversationLine = {
      ...mockLine,
      words: [
        { russian: 'Привет', pronunciation: 'Privet', japanese: 'こんにちは' },
        { russian: 'мир', pronunciation: 'mir', japanese: '世界' },
      ],
    };

    render(<ConversationCard line={lineWithMultipleWords} isListeningMode={false} />, {
      wrapper,
    });

    const wordChips = screen.getAllByTestId('word-chip');
    expect(wordChips).toHaveLength(2);
  });

  it('should have proper accessibility attributes', () => {
    render(<ConversationCard line={mockLine} isListeningMode={false} />, { wrapper });

    const russianTexts = screen.getAllByText('Привет');
    // Find the one that is the main text (has lang attribute)
    const mainRussianText = russianTexts.find(el => el.hasAttribute('lang'));
    expect(mainRussianText).toHaveAttribute('lang', 'ru');
  });

  it('should display speaker in a circle', () => {
    render(<ConversationCard line={mockLine} isListeningMode={false} />, { wrapper });

    const speakerBadge = screen.getByText('A');
    expect(speakerBadge).toHaveClass('rounded-full', 'bg-blue-500', 'text-white');
  });
});
