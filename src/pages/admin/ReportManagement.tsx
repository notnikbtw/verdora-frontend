import { useMemo, useState } from 'react';
import AdminLayout from '@components/layout/pageLayout/AdminLayout';
import AdminSectionHeader from '@components/common/section/AdminSectionHeader';
import ErrorSection from '@components/common/section/ErrorSection';
import { EmptySection } from '@components/common/section/EmptySection';
import {
  DashboardMetricCard,
  DashboardMetricCardSkeleton,
} from '@components/common/cards/DashboardMetricCard';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import TableSkeleton from '@components/common/section/TableSkeleton';
import EmptyIcon from '@components/common/section/EmptyIcon';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import {
  usePendingPaymentOrders,
  useRevenueReport,
  useTopCancelled,
  useTopPurchased,
} from '@api/report/report.hooks';
import {
  QuantityChart,
  RevenueChart,
} from '@components/admin/reports/ReportCharts';
import { formatOrderDate, formatOrderPrice } from '@/utils/order.utils';
import {
  getRecentRange,
  parsePositiveInteger,
  stripNonDigits,
} from '@/utils/report.utils';
import {
  DEFAULT_GROUP_BY,
  DEFAULT_PENDING_DAYS,
  GROUP_BY_OPTIONS,
  PENDING_DAYS_MAX_LENGTH,
  REPORT_TABLE_CONTAINER_CLASS,
} from '@/config/report.config';
import type { ReportGroupBy } from '@/types/report';
import {
  BarChart3,
  Clock,
  DollarSign,
  PackageCheck,
  PackageX,
  RefreshCw,
} from 'lucide-react';

const ReportManagement = () => {
  const [dateFrom, setDateFrom] = useState(() => getRecentRange().from);
  const [dateTo, setDateTo] = useState(() => getRecentRange().to);
  const [groupBy, setGroupBy] = useState<ReportGroupBy>(DEFAULT_GROUP_BY);
  const [pendingDaysInput, setPendingDaysInput] = useState(
    String(DEFAULT_PENDING_DAYS)
  );

  const validPendingDays = parsePositiveInteger(pendingDaysInput);

  const purchased = useTopPurchased();
  const cancelled = useTopCancelled();
  const revenueRangeError =
    !dateFrom || !dateTo
      ? 'Both From and To dates are required.'
      : dateFrom > dateTo
        ? 'The From date must not be after the To date.'
        : null;
  const revenue = useRevenueReport(
    { dateFrom, dateTo, groupBy },
    !revenueRangeError
  );
  const pending = usePendingPaymentOrders(validPendingDays);

  const isRefetching =
    purchased.isRefetching ||
    cancelled.isRefetching ||
    revenue.isRefetching ||
    pending.isRefetching;

  const refetchAll = () => {
    purchased.refetch();
    cancelled.refetch();
    revenue.refetch();
    pending.refetch();
  };

  const metrics = useMemo(() => {
    const totalRevenue = revenue.data?.reduce((sum, r) => sum + r.revenue, 0);
    return {
      revenue: totalRevenue,
      purchased: purchased.data?.reduce((s, p) => s + p.purchasedQuantity, 0),
      cancelled: cancelled.data?.reduce((s, p) => s + p.cancelledQuantity, 0),
      pending: pending.data?.length,
    };
  }, [revenue.data, purchased.data, cancelled.data, pending.data]);

  const formatPeriod = (iso: string) =>
    formatOrderDate(iso, groupBy === 'HOUR');

  const errorMessage = (e: {
    response?: { data?: { message?: string } };
    message?: string;
  }) =>
    e.response?.data?.message ||
    e.message ||
    'Something went wrong while fetching the report. Please try again.';

  return (
    <AdminLayout>
      <AdminSectionHeader
        title="Reports & Analytics"
        description="Track revenue, best sellers, cancellations and overdue payments."
      >
        <Button
          variant="outline"
          onClick={refetchAll}
          disabled={isRefetching}
          className="cursor-pointer gap-2"
        >
          <RefreshCw
            className={`size-4 ${isRefetching ? 'animate-spin' : ''}`}
          />
          Refresh
        </Button>
      </AdminSectionHeader>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {revenue.isLoading ? (
          <DashboardMetricCardSkeleton />
        ) : (
          <DashboardMetricCard
            value={
              revenueRangeError ? 'N/A' : formatOrderPrice(metrics.revenue)
            }
            title="Revenue"
            description="For the selected period"
            icon={DollarSign}
            error={revenue.isError}
            errorMessage="Failed to load revenue."
          />
        )}
        {purchased.isLoading ? (
          <DashboardMetricCardSkeleton />
        ) : (
          <DashboardMetricCard
            value={metrics.purchased?.toString() ?? 'N/A'}
            title="Top Purchased Units"
            description="Across top 10 products"
            icon={PackageCheck}
            error={purchased.isError}
            errorMessage="Failed to load purchases."
          />
        )}
        {cancelled.isLoading ? (
          <DashboardMetricCardSkeleton />
        ) : (
          <DashboardMetricCard
            value={metrics.cancelled?.toString() ?? 'N/A'}
            title="Top Cancelled Units"
            description="Across top 10 products"
            icon={PackageX}
            error={cancelled.isError}
            errorMessage="Failed to load cancellations."
          />
        )}
        {pending.isLoading ? (
          <DashboardMetricCardSkeleton />
        ) : (
          <DashboardMetricCard
            value={metrics.pending?.toString() ?? 'N/A'}
            title="Overdue Payments"
            description={`Pending longer than ${validPendingDays ?? '—'} days`}
            icon={Clock}
            error={pending.isError}
            errorMessage="Failed to load pending orders."
          />
        )}
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="py-4 px-6 border-b">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-base">Revenue</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Revenue grouped by {groupBy.toLowerCase()}.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="space-y-1 text-xs font-medium">
                From
                <Input
                  type="date"
                  required
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={e => setDateFrom(e.target.value)}
                />
              </label>
              <label className="space-y-1 text-xs font-medium">
                To
                <Input
                  type="date"
                  required
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={e => setDateTo(e.target.value)}
                />
              </label>
              <label className="space-y-1 text-xs font-medium">
                Group by
                <select
                  value={groupBy}
                  onChange={e => setGroupBy(e.target.value as ReportGroupBy)}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {GROUP_BY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {revenueRangeError ? (
            <EmptySection
              title="Select a period"
              description={revenueRangeError}
              className="px-6 py-12"
              icon={
                <div className="flex items-center justify-center rounded-full bg-primary/10 p-4">
                  <BarChart3
                    className="size-8 text-primary"
                    aria-hidden="true"
                  />
                </div>
              }
            />
          ) : revenue.isLoading ? (
            <TableSkeleton />
          ) : revenue.isError ? (
            <ErrorSection
              title="Failed to load revenue report"
              message={errorMessage(revenue.error)}
              onRetry={() => revenue.refetch()}
            />
          ) : !revenue.data || revenue.data.length === 0 ? (
            <EmptySection
              title="No revenue data"
              description="No revenue was recorded for the selected period."
              className="px-6 py-12"
              icon={
                <div className="flex items-center justify-center rounded-full bg-primary/10 p-4">
                  <BarChart3
                    className="size-8 text-primary"
                    aria-hidden="true"
                  />
                </div>
              }
            />
          ) : (
            <>
              <div className="px-6 py-4">
                <RevenueChart data={revenue.data} formatPeriod={formatPeriod} />
              </div>
              <Table containerClassName={REPORT_TABLE_CONTAINER_CLASS}>
                <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--border)]">
                  <TableRow>
                    <TableHead className="pl-6">Period</TableHead>
                    <TableHead className="text-right pr-6">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenue.data.map(item => (
                    <TableRow
                      key={item.periodStart}
                      className="hover:bg-muted/30"
                    >
                      <TableCell className="pl-6 text-sm whitespace-nowrap">
                        {formatPeriod(item.periodStart)}
                      </TableCell>
                      <TableCell className="text-right pr-6 font-semibold">
                        {formatOrderPrice(item.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        <Card className="border-border shadow-sm">
          <CardHeader className="py-4 px-6 border-b">
            <CardTitle className="text-base">Top Purchased Products</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Up to 10 products with the highest purchased quantity.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {purchased.isLoading ? (
              <TableSkeleton />
            ) : purchased.isError ? (
              <ErrorSection
                title="Failed to load top purchased"
                message={errorMessage(purchased.error)}
                onRetry={() => purchased.refetch()}
              />
            ) : !purchased.data || purchased.data.length === 0 ? (
              <EmptySection
                title="No purchases yet"
                icon={<EmptyIcon icon={PackageCheck} />}
                description="Purchased products will appear here."
                className="px-6 py-12"
              />
            ) : (
              <>
                <div className="px-6 py-4">
                  <QuantityChart
                    label="Purchased"
                    data={purchased.data.map(p => ({
                      name: p.productName,
                      quantity: p.purchasedQuantity,
                    }))}
                  />
                </div>
                <Table containerClassName={REPORT_TABLE_CONTAINER_CLASS}>
                  <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--border)]">
                    <TableRow>
                      <TableHead className="pl-6 w-16">#</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right pr-6">
                        Purchased
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchased.data.map((p, i) => (
                      <TableRow key={p.productId} className="hover:bg-muted/30">
                        <TableCell className="pl-6 text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {p.productName}
                        </TableCell>
                        <TableCell className="text-right pr-6 font-semibold">
                          {p.purchasedQuantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="py-4 px-6 border-b">
            <CardTitle className="text-base">Top Cancelled Products</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Up to 10 products with the highest cancelled quantity.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {cancelled.isLoading ? (
              <TableSkeleton />
            ) : cancelled.isError ? (
              <ErrorSection
                title="Failed to load top cancelled"
                message={errorMessage(cancelled.error)}
                onRetry={() => cancelled.refetch()}
              />
            ) : !cancelled.data || cancelled.data.length === 0 ? (
              <EmptySection
                title="No cancellations"
                icon={<EmptyIcon icon={PackageX} />}
                description="Cancelled products will appear here."
                className="px-6 py-12"
              />
            ) : (
              <>
                <div className="px-6 py-4">
                  <QuantityChart
                    label="Cancelled"
                    color="var(--destructive)"
                    data={cancelled.data.map(p => ({
                      name: p.productName,
                      quantity: p.cancelledQuantity,
                    }))}
                  />
                </div>
                <Table containerClassName={REPORT_TABLE_CONTAINER_CLASS}>
                  <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--border)]">
                    <TableRow>
                      <TableHead className="pl-6 w-16">#</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right pr-6">
                        Cancelled
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cancelled.data.map((p, i) => (
                      <TableRow key={p.productId} className="hover:bg-muted/30">
                        <TableCell className="pl-6 text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {p.productName}
                        </TableCell>
                        <TableCell className="text-right pr-6 font-semibold">
                          {p.cancelledQuantity}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="py-4 px-6 border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle className="text-base">
                Pending Payment Orders
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Orders that stayed in PENDING status longer than the chosen
                number of days.
              </CardDescription>
            </div>
            <label className="space-y-1 text-xs font-medium sm:w-40">
              Min. days pending
              <Input
                type="text"
                inputMode="numeric"
                maxLength={PENDING_DAYS_MAX_LENGTH}
                value={pendingDaysInput}
                onChange={e =>
                  setPendingDaysInput(stripNonDigits(e.target.value))
                }
                aria-invalid={validPendingDays === undefined}
              />
              {validPendingDays === undefined && (
                <span role="alert" className="block text-destructive">
                  Enter a whole number of 1 or more.
                </span>
              )}
            </label>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {validPendingDays === undefined ? (
            <EmptySection
              title="Invalid number of days"
              icon={<EmptyIcon icon={Clock} />}
              description="Enter a whole number of days (1 or more)."
              className="px-6 py-12"
            />
          ) : pending.isLoading ? (
            <TableSkeleton />
          ) : pending.isError ? (
            <ErrorSection
              title="Failed to load pending orders"
              message={errorMessage(pending.error)}
              onRetry={() => pending.refetch()}
            />
          ) : !pending.data || pending.data.length === 0 ? (
            <EmptySection
              title="No overdue orders"
              icon={<EmptyIcon icon={Clock} />}
              description="No orders have been pending for that long."
              className="px-6 py-12"
            />
          ) : (
            <Table containerClassName={REPORT_TABLE_CONTAINER_CLASS}>
              <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--border)]">
                <TableRow>
                  <TableHead className="pl-6 w-25">Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="text-center">Days pending</TableHead>
                  <TableHead className="text-right pr-6">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.data.map(order => (
                  <TableRow key={order.orderId} className="hover:bg-muted/30">
                    <TableCell className="pl-6 font-semibold">
                      #{order.orderId}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customer.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.customer.email}
                        <span className="hidden sm:inline">
                          {' · '}
                          {order.customer.phone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground whitespace-nowrap">
                      {formatOrderDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {order.pendingDays}
                    </TableCell>
                    <TableCell className="text-right pr-6 font-semibold">
                      {formatOrderPrice(order.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default ReportManagement;
