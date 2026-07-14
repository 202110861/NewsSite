import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.string().trim().min(1, "댓글 내용을 입력해 주세요.").max(2000),
});
