import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeAll(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should not be able to create a new statement with non-existence user", async () => {
    await usersRepositoryInMemory.create({
      name: "User Test",
      email: "usertest@email.com",
      password: "mypassword",
    });

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "non-existence-user-id",
        type: OperationType.DEPOSIT,
        amount: 40,
        description: "Deposit test",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a new withdraw statement while doesn't have enough balance", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User Test",
      email: "usertest@email.com",
      password: "mypassword",
    });

    await statementsRepositoryInMemory.create({
      user_id: user.id as string,
      description: "Deposit test",
      amount: 100,
      type: OperationType.DEPOSIT,
    });

    expect(async () => {
      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 200,
        description: "Withdraw test",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should be able to create a new deposit statement", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User Test",
      email: "usertest@email.com",
      password: "mypassword",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Deposit Test",
    });

    expect(statement).toHaveProperty("id");
    expect(statement).toHaveProperty("type", OperationType.DEPOSIT);
  });

  it("should be able to create a new withdraw statement", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "User Test",
      email: "usertest@email.com",
      password: "mypassword",
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 200,
      description: "Deposit Test",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 150,
      description: "Withdraw Test",
    });

    expect(statement).toHaveProperty("id");
    expect(statement).toHaveProperty("type", OperationType.WITHDRAW);
  });
});
