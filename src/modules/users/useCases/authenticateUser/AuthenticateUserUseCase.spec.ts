import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
  });

  it("should not be able to authenticate a user with wrong email", async () => {
    await createUserUseCase.execute({
      name: "User test",
      email: "usertest@email.com",
      password: "myuserpassword",
    });

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "usertest1@gmail.com",
        password: "myuserpassword",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate a user that its password doesn't match", async () => {
    await createUserUseCase.execute({
      name: "User test",
      email: "usertest@email.com",
      password: "myuserpassword",
    });

    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "usertest@gmail.com",
        password: "myuserpassword1",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should be able to authenticate a user using right credentials", async () => {
    await createUserUseCase.execute({
      name: "User test",
      email: "usertest@email.com",
      password: "myuserpassword",
    });

    const authenticatedUser = await authenticateUserUseCase.execute({
      email: "usertest@email.com",
      password: "myuserpassword",
    });

    expect(authenticatedUser).toHaveProperty("token");
    expect(authenticatedUser).toHaveProperty("user");
  });
});
