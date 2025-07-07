import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Prisma } from "@/generated/prisma";

type UserWithPosts = Prisma.UserGetPayload<{
  include: {
    posts: true;
  };
}>;

export default async function Home() {
  const users: UserWithPosts[] = await prisma.user.findMany({
    include: {
      posts: true,
    },
  });

  return (
    <div>
      <h1>Home</h1>
      <Button>Button</Button>
      <p>{users.length}</p>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <p>{user.name}</p>
            <p>{user.email}</p>
            <ul>
              {user.posts.map((post) => (
                <li key={post.id}>
                  <p>{post.title}</p>
                  <p>{post.content}</p>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
