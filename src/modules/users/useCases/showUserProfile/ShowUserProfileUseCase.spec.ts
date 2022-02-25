import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeAll(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepositoryInMemory
    );
  });

  it("should not be able to show a non-existence user profile", async () => {
    const errorHandler = expect(async () => {
      await showUserProfileUseCase.execute("user_id_test");
    }).rejects;

    errorHandler.toBeInstanceOf(ShowUserProfileError);
    errorHandler.toHaveProperty("message");
  });

  it("should be able to show a user profile", async () => {
    const { id: userId } = await usersRepositoryInMemory.create({
      name: "User Test",
      email: "usertest@email.com",
      password: "userprofilepassword",
    });

    const userProfile = await showUserProfileUseCase.execute(userId as string);

    expect(userProfile).toHaveProperty("id");
  });
});
