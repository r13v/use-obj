import { useCallback, useRef, useState } from "react"

/**
 * @typedef {RegExp | string} MutatingMethod
 */

/**
 * @typedef {Object} Options
 * @property {MutatingMethod[]} [mutatingMethods]
 */

let defaultMutatingMethods = [
  /^change/,
  /^set/,
  /^add/,
  /^remove/,
  /^delete/,
  /^insert/,
]

/**
 * Set the global mutating methods that should trigger a re-render.
 * @param {MutatingMethod[]} methods
 */
export function setMutatingMethods(methods) {
  defaultMutatingMethods = methods
}

/**
 * Keeps an instance of a class and return a proxied version of it.
 * Will re-render the component when a mutating method is called or a property is changed.
 * @template T
 * @param {() => T} factory
 * @param {Options} [options]
 * @returns {T}
 */
export function useObj(factory, options) {
  const mutatingMethodsRef = useRef(
    options?.mutatingMethods ?? defaultMutatingMethods,
  )

  const isMutatingMethod = useCallback((methodName) => {
    if (mutatingMethodsRef.current.length === 0) {
      return true
    }

    return mutatingMethodsRef.current.some((method) => {
      if (method instanceof RegExp) {
        return method.test(methodName)
      }

      return methodName.toLowerCase().includes(method.toLowerCase())
    })
  }, [])

  const update = useCallback(() => {
    setTimeout(() => {
      const newWrapped = new Proxy(
        instance.current,
        makeProxyHandler({ willChange: update, isMutatingMethod }),
      )
      setWrapped(newWrapped)
    }, 0)
  }, [])

  const instance = useRef(factory())

  const [wrapped, setWrapped] = useState(
    new Proxy(
      instance.current,
      makeProxyHandler({ willChange: update, isMutatingMethod }),
    ),
  )

  return wrapped
}

/**
 * @typedef {Object} ProxyHandlerParams
 * @property {() => void} willChange
 * @property {(methodName: string) => boolean} isMutatingMethod
 */

/**
 * @param {ProxyHandlerParams} params
 * @returns {ProxyHandler<any>}
 */
function makeProxyHandler({ willChange, isMutatingMethod }) {
  return {
    set(target, p, newValue) {
      willChange()

      return Reflect.set(target, p, newValue)
    },

    get(target, p, receiver) {
      const value = target[p]

      const isFunction = value instanceof Function

      if (!isFunction) {
        return Reflect.get(target, p, receiver)
      }

      return function (...args) {
        const isMutating = isMutatingMethod(p)
        const result = value.apply(this === receiver ? target : this, args)

        if (!isMutating) {
          return result
        }

        if (result instanceof Promise) {
          return result.finally(() => {
            willChange()
          })
        }

        willChange()
        return result
      }
    },
  }
}
