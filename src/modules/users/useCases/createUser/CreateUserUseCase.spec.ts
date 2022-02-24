import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should not be able to create a new user with same email", async () => {
    await usersRepositoryInMemory.create({
      email: "test@email.com",
      name: "Test",
      password: "mytestuser",
    });

    expect(async () => {
      await createUserUseCase.execute({
        email: "test@email.com",
        name: "TestUser2",
        password: "mytestuser2",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });

  it("should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "TestUser1",
      password: "TestUserPassword",
      email: "user@email.com",
    });

    expect(user).toHaveProperty("id");
    expect(user.name).toBe("TestUser1");
  });
});
