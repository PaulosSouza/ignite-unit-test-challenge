import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Balance", () => {
  beforeAll(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );
  });

  it("should not be able to get a balance from a non-existence user", () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "user_id_test",
      });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });

  it("should be able a get a balance from statements booked", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "user@email.com",
      password: "passwordTest",
      name: "User Test",
    });

    const user_id = user.id as string;

    await statementsRepositoryInMemory.create({
      user_id,
      amount: 300,
      description: "Deposit Test",
      type: OperationType.DEPOSIT,
    });

    await statementsRepositoryInMemory.create({
      user_id,
      amount: 299,
      description: "Withdraw Test",
      type: OperationType.WITHDRAW,
    });

    const { balance } = await getBalanceUseCase.execute({
      user_id,
    });

    expect(balance).toBe(1);
  });
});
