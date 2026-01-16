import { Post, PostAutoSetKeys, postKeys } from '../../interfaces/post/Posts';
import { createService } from "../../utils/base/serviceFactory";

const baseRepo = createService<Post, PostAutoSetKeys>({
    table: 'post.posts',
    keys: postKeys
});

const postService = {
    ...baseRepo,
};

export default postService;