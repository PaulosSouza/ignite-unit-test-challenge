import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Balance", () => {
  beforeAll(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should not be able to get a statement operation from a non-existence user", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "user_id_test",
        statement_id: "statement_id_test",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get a statement operation from a non-existence operation", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "user@email.com",
      password: "passwordTest",
      name: "User Test",
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "statement_id_test",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

  it("should be able a get a statement operation", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "user@email.com",
      password: "passwordTest",
      name: "User Test",
    });

    const user_id = user.id as string;

    const statement = await statementsRepositoryInMemory.create({
      user_id,
      amount: 300,
      description: "Deposit Test",
      type: OperationType.DEPOSIT,
    });

    const statement_id = statement.id as string;

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    });

    expect(statementOperation).toBe(statement);
  });
});
