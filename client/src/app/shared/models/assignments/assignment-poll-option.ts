import { Deserializer } from '../base/deserializer';
import { PollVoteValue } from 'app/core/ui-services/poll.service';

/**
 * Representation of a poll option
 *
 * part of the 'polls-options'-array in poll
 * @ignore
 */
export class AssignmentPollOption extends Deserializer {
    public id: number; // The AssignmentUser id of the candidate
    public candidate_id: number; // the User id of the candidate
    public is_elected: boolean;
    public votes: {
        weight: number; // represented as a string because it's a decimal field
        value: PollVoteValue;
    }[];
    public poll_id: number;
    public weight: number; // weight to order the display

    /**
     * Needs to be completely optional because poll has (yet) the optional parameter 'poll-options'
     *
     * @param input
     */
    public constructor(input?: any) {
        if (input && input.votes) {
            input.votes.forEach(vote => {
                if (vote.weight) {
                    vote.weight = parseFloat(vote.weight);
                }
            });
        }
        super(input);
    }
}
