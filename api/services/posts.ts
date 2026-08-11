import { Op, type Includeable, type Transaction, type WhereOptions } from "sequelize";
import { Feed, Post, PostFeed, User } from "@/models";

export const postIncludes: Includeable[] = [
  { model: User, as: "author", attributes: ["id", "name", "email", "role"] },
  { model: Feed, as: "feeds", through: { attributes: [] } },
];

export function findPost(id: number, transaction?: Transaction) {
  return Post.findByPk(id, { include: postIncludes, transaction });
}

export async function listPosts(filters: URLSearchParams) {
  const page = Number(filters.get("page") ?? "1");
  const pageSize = Number(filters.get("pageSize") ?? "50");
  if (!Number.isInteger(page) || page < 1) throw new RangeError("Page must be a positive integer");
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100)
    throw new RangeError("Page size must be between 1 and 100");

  const where: WhereOptions = {};
  const search = filters.get("search")?.trim();
  if (search) {
    Object.assign(where, {
      [Op.or]: [{ title: { [Op.like]: `%${search}%` } }, { body: { [Op.like]: `%${search}%` } }],
    });
  }
  const authorId = filters.get("authorId");
  if (authorId) Object.assign(where, { authorId });
  const feedId = filters.get("feedId") ?? filters.get("topicId");
  const include: Includeable[] = [
    { model: User, as: "author", attributes: ["id", "name", "email", "role"] },
    {
      model: Feed,
      as: "feeds",
      through: { attributes: [] },
      ...(feedId ? { where: { id: feedId }, required: true } : {}),
    },
  ];
  const result = await Post.findAndCountAll({
    where,
    include,
    distinct: true,
    order: [["publishedAt", "DESC"]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });
  return { ...result, page, pageSize };
}

export async function replacePostFeeds(
  postId: number,
  feedIds: string[],
  transaction: Transaction,
) {
  await PostFeed.destroy({ where: { postId }, transaction });
  await PostFeed.bulkCreate(
    feedIds.map((feedId) => ({ postId, feedId })),
    { transaction },
  );
}
