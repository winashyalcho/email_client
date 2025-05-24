import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createUser() {
  try {
    const newUser = await prisma.user.create({
      data: {
        name: "John Doe",
        email: "johndoe@example.com",
        image: "https://example.com/avatar.png",
        emailVerified: new Date(), // optional
      },
    });

    console.log("User created successfully:", newUser);
  } catch (error) {
    console.error("Error creating user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
