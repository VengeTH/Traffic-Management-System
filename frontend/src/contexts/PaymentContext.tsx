import React, { createContext, useContext, useReducer, ReactNode } from "react"
import { Payment, PaymentGateway, PaymentInitiationRequest } from "../types"
import { apiService } from "../services/api"
import toast from "react-hot-toast"

// Payment state interface
interface PaymentState {
  currentPayment: Payment | null
  paymentGateways: PaymentGateway[]
  loading: boolean
  error: string | null
}

// Payment action types
type PaymentAction =
  | { type: "PAYMENT_START" }
  | { type: "PAYMENT_SUCCESS"; payload: Payment }
  | { type: "PAYMENT_FAILURE"; payload: string }
  | { type: "SET_GATEWAYS"; payload: PaymentGateway[] }
  | { type: "CLEAR_PAYMENT" }
  | { type: "SET_LOADING"; payload: boolean }

// Initial state
const initialState: PaymentState = {
  currentPayment: null,
  paymentGateways: [
    {
      id: "paymongo",
      name: "paymongo",
      displayName: "PayMongo",
      description: "Secure online payment processing for Philippine businesses",
      logo: "/images/paymongo-logo.png",
      icons: ["credit-card", "bank-transfer"],
      isActive: true,
      processingFee: 0.025,
      processingFeeType: "percentage",
    },
    {
      id: "gcash",
      name: "gcash",
      displayName: "GCash",
      description: "Mobile wallet for fast and secure payments",
      logo: "/images/gcash-logo.png",
      icons: ["mobile", "wallet"],
      isActive: true,
      processingFee: 15,
      processingFeeType: "fixed",
    },
    {
      id: "maya",
      name: "maya",
      displayName: "Maya",
      description: "Digital banking and payment solutions",
      logo: "/images/maya-logo.png",
      icons: ["mobile", "bank"],
      isActive: true,
      processingFee: 15,
      processingFeeType: "fixed",
    },
    {
      id: "dragonpay",
      name: "dragonpay",
      displayName: "DragonPay",
      description: "Multi-channel payment gateway for Philippine businesses",
      logo: "/images/dragonpay-logo.png",
      icons: ["bank-transfer", "cash"],
      isActive: true,
      processingFee: 20,
      processingFeeType: "fixed",
    },
    {
      id: "credit_card",
      name: "credit_card",
      displayName: "Credit Card",
      description: "Secure credit card payment processing",
      logo: "/images/credit-card-logo.png",
      icons: ["credit-card"],
      isActive: true,
      processingFee: 0.03,
      processingFeeType: "percentage",
    },
    {
      id: "debit_card",
      name: "debit_card",
      displayName: "Debit Card",
      description: "Direct bank account payment processing",
      logo: "/images/debit-card-logo.png",
      icons: ["debit-card"],
      isActive: true,
      processingFee: 0.025,
      processingFeeType: "percentage",
    },
  ],
  loading: false,
  error: null,
}

// Payment reducer
const paymentReducer = (
  state: PaymentState,
  action: PaymentAction
): PaymentState => {
  switch (action.type) {
    case "PAYMENT_START":
      return {
        ...state,
        loading: true,
        error: null,
      }
    case "PAYMENT_SUCCESS":
      return {
        ...state,
        currentPayment: action.payload,
        loading: false,
        error: null,
      }
    case "PAYMENT_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case "SET_GATEWAYS":
      return {
        ...state,
        paymentGateways: action.payload,
      }
    case "CLEAR_PAYMENT":
      return {
        ...state,
        currentPayment: null,
        error: null,
      }
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      }
    default:
      return state
  }
}

// Payment context interface
interface PaymentContextType extends PaymentState {
  initiatePayment: (paymentData: PaymentInitiationRequest) => Promise<Payment>
  confirmPayment: (
    paymentId: string,
    gatewayTransactionId: string
  ) => Promise<Payment>
  getPayment: (paymentId: string) => Promise<Payment>
  getPaymentReceipt: (paymentId: string) => Promise<Blob>
  clearPayment: () => void
  calculateProcessingFee: (amount: number, gatewayId: string) => number
  getGatewayById: (gatewayId: string) => PaymentGateway | undefined
}

// Create context
const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

// Payment provider props
interface PaymentProviderProps {
  children: ReactNode
}

// Payment provider component
export const PaymentProvider: React.FC<PaymentProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(paymentReducer, initialState)

  // Initiate payment
  const initiatePayment = async (
    paymentData: PaymentInitiationRequest
  ): Promise<Payment> => {
    try {
      dispatch({ type: "PAYMENT_START" })
      const response = await apiService.initiatePayment(paymentData)

      // * API returns { success: true, data: { payment: {...}, redirectUrl: "...", ... } }
      const payment = (response.data?.payment ?? response.data) as Payment
      dispatch({ type: "PAYMENT_SUCCESS", payload: payment })

      toast.success("Payment initiated successfully")
      return payment
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to initiate payment"
      dispatch({ type: "PAYMENT_FAILURE", payload: message })
      toast.error(message)
      throw error
    }
  }

  // Confirm payment
  const confirmPayment = async (
    paymentId: string,
    gatewayTransactionId: string
  ): Promise<Payment> => {
    try {
      dispatch({ type: "PAYMENT_START" })
      const response = await apiService.confirmPayment({
        paymentId,
        gatewayTransactionId,
      })

      // * API returns { success: true, data: { payment: {...} } }
      const payment = (response.data?.payment ?? response.data) as Payment
      dispatch({ type: "PAYMENT_SUCCESS", payload: payment })

      toast.success("Payment confirmed successfully")
      return payment
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to confirm payment"
      dispatch({ type: "PAYMENT_FAILURE", payload: message })
      toast.error(message)
      throw error
    }
  }

  // Get payment details
  const getPayment = async (paymentId: string): Promise<Payment> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      const response = await apiService.getPayment(paymentId)

      // * API returns { success: true, data: { payment: {...} } }
      const payment = (response.data?.payment ?? response.data) as Payment
      dispatch({ type: "PAYMENT_SUCCESS", payload: payment })

      return payment
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to get payment details"
      dispatch({ type: "PAYMENT_FAILURE", payload: message })
      toast.error(message)
      throw error
    }
  }

  // Get payment receipt
  const getPaymentReceipt = async (paymentId: string): Promise<Blob> => {
    try {
      // * API service returns Blob directly (not wrapped in response object)
      const receiptBlob = await apiService.getPaymentReceipt(paymentId)
      return receiptBlob
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to get payment receipt"
      toast.error(message)
      throw error
    }
  }

  // Clear current payment
  const clearPayment = () => {
    dispatch({ type: "CLEAR_PAYMENT" })
  }

  // Calculate processing fee
  const calculateProcessingFee = (
    amount: number,
    gatewayId: string
  ): number => {
    const gateway = getGatewayById(gatewayId)
    if (!gateway) return 0

    if (gateway.processingFeeType === "percentage") {
      return amount * gateway.processingFee
    } else {
      return gateway.processingFee
    }
  }

  // Get gateway by ID
  const getGatewayById = (gatewayId: string): PaymentGateway | undefined => {
    return state.paymentGateways.find((gateway) => gateway.id === gatewayId)
  }

  const value: PaymentContextType = {
    ...state,
    initiatePayment,
    confirmPayment,
    getPayment,
    getPaymentReceipt,
    clearPayment,
    calculateProcessingFee,
    getGatewayById,
  }

  return (
    <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>
  )
}

// Custom hook to use payment context
export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error("usePayment must be used within a PaymentProvider")
  }
  return context
}
