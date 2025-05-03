"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addMoneyBySugarDadddy, doPayment, getAccountInfo } from "@/actions/payments";
import { PageHeader } from "@/components/page-header";

export default function DevPage() {
  const [accountInfo, setAccountInfo] = useState<Awaited<ReturnType<typeof getAccountInfo>> | null>(null);
  const [loadingAccountInfo, setLoadingAccountInfo] = useState(false);

  const [sugarDaddyAmount, setSugarDaddyAmount] = useState("");
  const [loadingSugarDaddy, setLoadingSugarDaddy] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);

  const handleGetAccountInfo = async () => {
    try {
      setLoadingAccountInfo(true);
      const info = await getAccountInfo();
      setAccountInfo(info);
      toast.success("Account info loaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to get account info");
    } finally {
      setLoadingAccountInfo(false);
    }
  };

  const handleRequestMoney = async () => {
    try {
      if (!sugarDaddyAmount || isNaN(Number(sugarDaddyAmount))) {
        toast.error("Please enter a valid amount");
        return;
      }

      setLoadingSugarDaddy(true);
      await addMoneyBySugarDadddy(Number(sugarDaddyAmount));
      toast.success(`Requested €${sugarDaddyAmount} from Sugar Daddy`);
      setSugarDaddyAmount("");

      // Refresh account info after request
      await handleGetAccountInfo();
    } catch (error) {
      console.error(error);
      toast.error("Failed to request money");
    } finally {
      setLoadingSugarDaddy(false);
    }
  };

  const handleSendPayment = async () => {
    try {
      if (!paymentAmount || isNaN(Number(paymentAmount))) {
        toast.error("Please enter a valid payment amount");
        return;
      }

      if (!paymentDescription) {
        toast.error("Please enter a payment description");
        return;
      }

      setLoadingPayment(true);
      await doPayment(Number(paymentAmount), paymentDescription);
      toast.success(`Payment of €${paymentAmount} sent successfully`);
      setPaymentAmount("");
      setPaymentDescription("");

      // Refresh account info after payment
      await handleGetAccountInfo();
    } catch (error) {
      console.error(error);
      toast.error("Failed to send payment");
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Developer Tools" />

      <p className="text-muted-foreground mb-6">
        View your account information, request money from Sugar Daddy, and test payments.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Account Information</h3>

          <div className="space-y-4">
            <Button onClick={handleGetAccountInfo} disabled={loadingAccountInfo} className="w-full">
              {loadingAccountInfo ? "Loading..." : "Get Account Info"}
            </Button>

            {accountInfo && (
              <div className="mt-4 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2 p-2 border rounded-md">
                  <span className="font-medium">Balance:</span>
                  <span>€{accountInfo.balance.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2 border rounded-md">
                  <span className="font-medium">Daily Limit:</span>
                  <span>€{accountInfo.dailyLimit.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2 border rounded-md">
                  <span className="font-medium">Account ID:</span>
                  <span className="overflow-auto">{accountInfo.accountId}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2 border rounded-md">
                  <span className="font-medium">External ID:</span>
                  <span className="overflow-auto">{accountInfo.externalId}</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Request Money from Sugar Daddy</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="sugarDaddyAmount">Amount (EUR)</Label>
                <Input
                  id="sugarDaddyAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={sugarDaddyAmount}
                  onChange={(e) => setSugarDaddyAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <Button onClick={handleRequestMoney} disabled={loadingSugarDaddy || !sugarDaddyAmount} className="w-full">
                {loadingSugarDaddy ? "Processing..." : "Request Money"}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Send Payment</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="paymentAmount">Amount (EUR)</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <Label htmlFor="paymentDescription">Description</Label>
                <Input
                  id="paymentDescription"
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  placeholder="Enter payment description"
                />
              </div>

              <Button
                onClick={handleSendPayment}
                disabled={loadingPayment || !paymentAmount || !paymentDescription}
                className="w-full"
              >
                {loadingPayment ? "Processing..." : "Send Payment"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
