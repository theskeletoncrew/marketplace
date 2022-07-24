import React, { createContext, useState, useContext } from 'react'
import Button, { ButtonSize } from '../../components/Button'
import Modal from '../../components/Modal/Modal'
import { errorCodeHelper } from '../../utils/errorCodes'

type AsyncFunction = (arg?: any) => Promise<void>
export type Action = {
  name: string
  id: string
  action: AsyncFunction
  param: any
}

interface ActionSettings {
  onComplete?: () => Promise<void>
  onActionSuccess?: (txName: string) => Promise<void>
  onActionFailure?: (err: any) => Promise<void>
}

interface MultiTransactionState {
  hasActionPending: boolean
  hasRemainingActions: boolean
  actions: Action[]
  runActions: (actions: Action[], settings?: ActionSettings) => Promise<void>
  retryActions: (settings?: ActionSettings) => Promise<void>
  clearActions: () => void
  onFinished?: () => Promise<void>
  onStart?: () => Promise<void>
}

const defaultState: MultiTransactionState = {
  hasRemainingActions: false,
  hasActionPending: false,
  actions: [],
  clearActions: () => {},
  runActions: async ([]) => {},
  retryActions: async () => {},
}

export const MultiTransactionContext =
  createContext<MultiTransactionState>(defaultState)

interface Props {
  children: React.ReactNode
}

export const MultiTransactionProvider: React.FC<Props> = ({ children }) => {
  const [hasActionPending, setHasActionPending] = useState(false)
  const [actions, setActions] = useState<Action[]>([])
  const [numActions, setNumActions] = useState(0)
  const [hasRemainingActions, setHasRemainingActions] = useState(false)
  const [message, setMessage] = useState<string>(
    `Sign the message in your wallet to continue`
  )
  const [hasError, setHasError] = useState(false)

  const closeModal = () => {
    setHasRemainingActions(false)
    setActions([])
  }

  const clearActions = () => {
    setActions([])
    setHasActionPending(false)
    setNumActions(0)
  }

  const retryActions = async (settings?: ActionSettings) => {
    setNumActions(actions.length)

    if (actions.length <= 0) {
      // no actions
      return
    }
    if (!hasActionPending) {
      try {
        setHasActionPending(true)
        let filtered = actions
        for (const action of actions) {
          setMessage(action.name)
          await action.action(action.param)
          await settings?.onActionSuccess?.(action.id)
          // clear action
          filtered = filtered.filter((x) => x.id !== action.id)
          setActions(filtered)
          setHasError(false)
        }
        setHasRemainingActions(false)
      } catch (err: any) {
        const errorMsg: string = err.message
        if (
          errorMsg.includes(`User rejected the request`) ||
          errorMsg.includes(`was not confirmed`) ||
          errorMsg.includes(`It is unknown if it succeeded or failed`)
        ) {
          setActions([])
          setHasRemainingActions(false)
        } else {
          setHasError(true)
        }
        await settings?.onActionFailure?.(err)
        setHasActionPending(false)
      } finally {
        setHasActionPending(false)
        await settings?.onComplete?.()
      }
    }
  }

  const runActions = async (
    newActions: Action[],
    settings?: ActionSettings
  ) => {
    if (hasRemainingActions) {
      throw new Error(`Has pending actions from a previous transaction`)
    }
    const newActionsWithIds: Action[] = newActions.map((action) => {
      return {
        ...action,
      }
    })

    if (!hasActionPending && !hasRemainingActions) {
      // clears old actions if running without retry
      clearActions()
      setActions(newActionsWithIds)
      setNumActions(newActionsWithIds.length)

      if (newActionsWithIds.length <= 0) {
        // no actions
        return
      }
      try {
        setHasError(false)
        setHasRemainingActions(true)
        setHasActionPending(true)
        let filtered = newActionsWithIds
        for (const action of newActionsWithIds) {
          setMessage(action.name)
          await action.action(action.param)
          await settings?.onActionSuccess?.(action.id)
          // clear action
          filtered = filtered.filter((x) => x.id !== action.id)
          setActions(filtered)
        }
        setHasRemainingActions(false)
      } catch (err: any) {
        const errorMsg: string = err.message

        if (
          errorMsg.includes(`User rejected the request`) ||
          errorMsg.includes(`was not confirmed`) ||
          errorMsg.includes(`It is unknown if it succeeded or failed`)
        ) {
          setActions([])
          setHasRemainingActions(false)
        } else {
          setHasError(true)
        }
        await settings?.onActionFailure?.(errorCodeHelper(err.message))
        setHasActionPending(false)
      } finally {
        setHasActionPending(false)
        await settings?.onComplete?.()
      }
    }
  }

  const completedActions = numActions - actions.length
  const percentage =
    numActions > 0 && completedActions < numActions
      ? ((completedActions + 1) / numActions) * 100
      : 0

  return (
    <MultiTransactionContext.Provider
      value={{
        hasRemainingActions,
        hasActionPending,
        actions,
        runActions,
        retryActions,
        clearActions,
      }}
    >
      <Modal
        title={`Please wait...`}
        open={hasRemainingActions || actions.length > 0}
        setOpen={closeModal}
        priority={true}
      >
        <div className={`mt-8`}>
          <p className={`text-center`}>{message}</p>
        </div>
        <div className={`mt-8`}>
          <div className={`h-2 w-full rounded-full bg-gray-800`}>
            <div
              className={`relative flex h-full rounded-full`}
              style={{ width: `${percentage}%` }}
            >
              <div
                className={`relative flex h-full w-full animate-loading rounded-full bg-gray-300`}
              ></div>
            </div>
          </div>
          <p className={`mt-4 text-center text-gray-300`}>
            {completedActions} of {numActions}
          </p>
          {hasError && (
            <div className={`flex w-full px-4`}>
              <Button
                className={`w-full`}
                disabled={hasActionPending}
                loading={hasActionPending}
                size={ButtonSize.Small}
                onClick={retryActions}
              >
                Retry?
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {children}
    </MultiTransactionContext.Provider>
  )
}

export const useMultiTransactionModal = () => {
  const multiTransactionModal = useContext(MultiTransactionContext)
  if (!multiTransactionModal) {
    throw new Error(
      'useMultiTransactionModal must be used within a MultiTransactionContext'
    )
  }
  return multiTransactionModal
}
