import ActivityKit
import SwiftUI
import WidgetKit

struct FocusLiveActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var taskName: String
        var sessionIndex: Int
        var sessionCount: Int
        var totalSeconds: Int
        var elapsedSeconds: Int
        var breakAfterSeconds: Int
        var isMuted: Bool
        var isPaused: Bool
        var updatedAt: Date = .now
    }

    var appName: String
}

struct FocusLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: FocusLiveActivityAttributes.self) { context in
            ExpandedFocusView(context: context)
                .activityBackgroundTint(.clear)
                .activitySystemActionForegroundColor(.white)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    IslandLeadingView(context: context)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    IslandTrailingView(context: context)
                }
                DynamicIslandExpandedRegion(.center) {
                    IslandCenterView(context: context)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    ControlRowView(state: context.state)
                }
            } compactLeading: {
                Text(formatTimeRemaining(context.state))
                    .font(.system(size: 13, weight: .semibold, design: .rounded))
            } compactTrailing: {
                ProgressGaugeView(progress: progress(for: context.state))
                    .frame(width: 22, height: 22)
            } minimal: {
                ProgressGaugeView(progress: progress(for: context.state))
                    .frame(width: 26, height: 26)
            }
        }
    }
}

private struct ExpandedFocusView: View {
    let context: ActivityViewContext<FocusLiveActivityAttributes>

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .stroke(Color.white.opacity(0.16), lineWidth: 1)
                )

            VStack(alignment: .leading, spacing: 18) {
                HStack(alignment: .center) {
                    Text(context.attributes.appName.uppercased())
                        .font(.caption.weight(.semibold))
                        .kerning(2)
                        .foregroundStyle(Color.white.opacity(0.8))
                    Spacer()
                    Text(context.state.taskName)
                        .font(.caption.weight(.medium))
                        .foregroundStyle(Color.white.opacity(0.72))
                        .lineLimit(1)
                }

                ProgressBarView(state: context.state)

                VStack(alignment: .leading, spacing: 12) {
                    Text(formatTimeRemaining(context.state))
                        .font(.system(size: 48, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.white)
                        .minimumScaleFactor(0.6)
                    Text(context.state.isPaused ? "Paused" : "In progress")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(Color.white.opacity(0.7))
                }

                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 6) {
                            Image(systemName: "flag")
                                .font(.caption2.weight(.semibold))
                            Text("Session \(context.state.sessionIndex) of \(context.state.sessionCount)")
                                .font(.caption2.weight(.semibold))
                        }
                        .foregroundStyle(Color.white)
                        Text("Break after: \(formatTime(context.state.breakAfterSeconds))")
                            .font(.caption2)
                            .foregroundStyle(Color.white.opacity(0.7))
                    }
                    Spacer()
                    ControlRowView(state: context.state)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                }
            }
            .padding(20)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
    }
}

private struct IslandLeadingView: View {
    let context: ActivityViewContext<FocusLiveActivityAttributes>

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(context.attributes.appName.uppercased())
                .font(.caption2.weight(.bold))
                .kerning(1.4)
            Text(formatTimeRemaining(context.state))
                .font(.title2.weight(.semibold))
        }
        .foregroundStyle(Color.white)
    }
}

private struct IslandTrailingView: View {
    let context: ActivityViewContext<FocusLiveActivityAttributes>

    var body: some View {
        VStack(alignment: .trailing, spacing: 4) {
            Text("Session \(context.state.sessionIndex)/\(context.state.sessionCount)")
                .font(.caption2.weight(.semibold))
            Text(context.state.isPaused ? "Paused" : "In progress")
                .font(.caption2)
                .foregroundStyle(Color.white.opacity(0.72))
        }
        .foregroundStyle(Color.white)
    }
}

private struct IslandCenterView: View {
    let context: ActivityViewContext<FocusLiveActivityAttributes>

    var body: some View {
        ProgressBarView(state: context.state)
    }
}

private struct ControlRowView: View {
    var state: FocusLiveActivityAttributes.ContentState

    var body: some View {
        HStack(spacing: 16) {
            ForEach(controls, id: \.0) { item in
                VStack(spacing: 6) {
                    Image(systemName: item.0)
                        .font(.system(size: 17, weight: .semibold))
                        .frame(width: 34, height: 34)
                        .background(Circle().fill(Color.white.opacity(0.9)))
                        .foregroundStyle(Color.black)
                    Text(item.1)
                        .font(.caption2)
                        .foregroundStyle(Color.white.opacity(0.75))
                }
            }
        }
    }

    private var controls: [(String, String)] {
        let playPauseIcon = state.isPaused ? "play.fill" : "pause.fill"
        let playPauseLabel = state.isPaused ? "Resume" : "Pause"
        let soundIcon = state.isMuted ? "speaker.slash.fill" : "speaker.wave.2.fill"
        let soundLabel = state.isMuted ? "Muted" : "Sound"

        return [
            ("power", "End"),
            ("gearshape", "Settings"),
            (playPauseIcon, playPauseLabel),
            ("stop.fill", "Stop"),
            (soundIcon, soundLabel),
        ]
    }
}

private struct ProgressBarView: View {
    let state: FocusLiveActivityAttributes.ContentState

    var body: some View {
        VStack(spacing: 8) {
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Capsule()
                        .fill(Color.white.opacity(0.2))
                        .frame(height: 6)
                    Capsule()
                        .fill(Color.white)
                        .frame(width: geometry.size.width * CGFloat(progress(for: state)), height: 6)
                        .animation(.easeInOut(duration: 0.25), value: progress(for: state))
                }
            }
            .frame(height: 6)

            HStack {
                Text(formatTime(state.elapsedSeconds))
                Spacer()
                Text(formatTime(state.totalSeconds))
            }
            .font(.caption2)
            .foregroundStyle(Color.white.opacity(0.7))
        }
    }
}

private struct ProgressGaugeView: View {
    let progress: Double

    var body: some View {
        Gauge(value: progress) {
            EmptyView()
        }
        .gaugeStyle(.accessoryCircular)
        .tint(Color.white)
    }
}

private func progress(for state: FocusLiveActivityAttributes.ContentState) -> Double {
    guard state.totalSeconds > 0 else { return 0 }
    return min(max(Double(state.elapsedSeconds) / Double(state.totalSeconds), 0), 1)
}

private func formatTime(_ seconds: Int) -> String {
    let safe = max(seconds, 0)
    let minutes = safe / 60
    let remaining = safe % 60
    return String(format: "%02d:%02d", minutes, remaining)
}

private func formatTimeRemaining(_ state: FocusLiveActivityAttributes.ContentState) -> String {
    let remaining = max(state.totalSeconds - state.elapsedSeconds, 0)
    return formatTime(remaining)
}

#Preview("Focus Live Activity", as: .content, using: FocusLiveActivityAttributes(appName: "LEORA")) {
    FocusLiveActivityWidget()
} contentStates: {
    FocusLiveActivityAttributes.ContentState(
        taskName: "Working on Leora project",
        sessionIndex: 2,
        sessionCount: 4,
        totalSeconds: 60 * 60,
        elapsedSeconds: 32 * 60 + 10,
        breakAfterSeconds: 25 * 60,
        isMuted: false,
        isPaused: false
    )
}
