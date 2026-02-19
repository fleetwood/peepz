import { randItem } from './array';
import { capFirst } from './text';
const NAME_ADJECTIVES = ['brave', 'calm', 'clever', 'kind', 'lucky', 'rapid', 'sunny', 'wild'];
const NAME_COLORS = ['red', 'blue', 'green', 'gold', 'silver', 'purple', 'orange', 'teal'];
const NAME_NAMES = ['fox', 'otter', 'hawk', 'bear', 'lion', 'tiger', 'whale', 'eagle'];
export function randName() {
    const adj = randItem(NAME_ADJECTIVES);
    const col = randItem(NAME_COLORS);
    const name = randItem(NAME_NAMES);
    return `${capFirst(adj)} ${capFirst(col)} ${capFirst(name)}`;
}
