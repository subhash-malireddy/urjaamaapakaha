"use client";
import { type DeviceSelectionList } from "@/lib/zod/usage";
import FiltersForm from "./filters-form";
import { useState } from "react";
import { getUsageDataAction } from "@/lib/actions/usage-actions";
export default function ChartWithFilters({
  devices,
}: {
  devices: DeviceSelectionList;
}) {
  const [usageData, setUsageData] =
    useState<Awaited<ReturnType<typeof getUsageDataAction>>>();
  console.log("📜usageData:: ", usageData);
  return (
    <div className="flex w-full flex-col">
      <FiltersForm
        devices={devices}
        onDataFetched={(data) => setUsageData(data)}
      />
      <div data-testid="chart" className="flex w-full">
        {/* for now, we will display textual data as per the details in usage-screen-implemenation notepad */}
        {usageData && (
          <div className="flex flex-col gap-2">
            <h3>User vs Total Usage</h3>
            <p>
              {usageData.data?.userConsumption.reduce((acc, curr) => {
                const result = acc + curr.consumption;
                console.log("📜result:: ", result);
                return result;
              }, 0)}
              &nbsp;vs&nbsp;
              {usageData.data?.totalConsumption.reduce(
                (acc, curr) => acc + curr.consumption,
                0,
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
