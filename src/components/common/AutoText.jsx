import { useAutoText } from '../../hooks/useAutoText';

// Component wrapper so lists can auto-translate per item without calling the hook in a loop.
export default function AutoText({ text }) {
  return useAutoText(text);
}
