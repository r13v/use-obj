# use-instance

A React hook that keeps an instance of a class and re-renders the component when the instance changes.

## Installation

```sh
npm install use-instance
```

## Usage

```tsx
import { useObj } from "use-obj"

class User {
  constructor(
    public name: string,
    private _pets: Pet[] = [],
  ) {}

  get username() {
    return this.name.toLowerCase().replace(" ", "-")
  }

  changeName(name: string) {
    this.name = name
  }

  print() {
    const pets = this._pets.map((pet) => pet.name).join(", ")
    console.log(`Name: ${this.name}; Pets: ${pets}`)
  }

  addPet(pet: Pet) {
    this._pets.push(pet)
  }

  get pets() {
    return this._pets
  }
}

class Pet {
  constructor(public name: string) {}
}

export function App() {
  const user = obj(() => new User("John Doe", [new Pet("Fluffy")]))

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.username}</p>

      <button onClick={() => user.changeName("Jane Doe")}>
        Change Name (method)
      </button>

      <button
        onClick={() => {
          user.name = "Alice Doe"
        }}
      >
        Change Name (Direct)
      </button>

      <button onClick={() => user.print()}>Print</button>

      <div>
        <h2>Pets</h2>
        <input
          type="text"
          placeholder="Pet Name"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              user.addPet(new Pet(e.currentTarget.value))
              e.currentTarget.value = ""
            }
          }}
        />

        <ul>
          {user.pets.map((pet, i) => (
            <li key={i}>{pet.name}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```