import ActivityKit
import SwiftUI
import WidgetKit

struct LiveActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var title: String
        var subtitle: String?
        var timerEndDateInMilliseconds: Double?
        var progress: Double?
        var imageName: String?
        var dynamicIslandImageName: String?
    }

    var name: String
    var backgroundColor: String?
    var titleColor: String?
    var subtitleColor: String?
    var progressViewTint: String?
    var progressViewLabelColor: String?
    var deepLinkUrl: String?
    var timerType: DynamicIslandTimerType?
    var padding: Int?
    var paddingDetails: PaddingDetails?
    var imagePosition: String?
    var imageSize: Int?
    var imageAlign: String?

    enum DynamicIslandTimerType: String, Codable {
        case circular
        case digital
    }

    struct PaddingDetails: Codable, Hashable {
        var top: Int?
        var bottom: Int?
        var left: Int?
        var right: Int?
        var vertical: Int?
        var horizontal: Int?
    }
}

struct FocusLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: LiveActivityAttributes.self) { context in
            FocusLiveActivityExpandedView(state: context.state)
                .activityBackgroundTint(.black.opacity(0.9))
                .activitySystemActionForegroundColor(Color.white)
        } dynamicIsland: { context in
            let tint: Color = .white

            return DynamicIsland {
                DynamicIslandExpandedRegion(.center) {
                    FocusDynamicIslandExpanded(state: context.state, tint: tint)
                }
            } compactLeading: {
                Text(FocusTimeFormatter.elapsedText(from: context.state))
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .monospacedDigit()
                    .foregroundStyle(Color.white)
            } compactTrailing: {
                Text("L")
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                    .foregroundStyle(Color.white.opacity(0.85))
            } minimal: {
                Text(FocusTimeFormatter.elapsedText(from: context.state))
                    .font(.system(size: 14, weight: .semibold, design: .rounded))
                    .monospacedDigit()
                    .foregroundStyle(Color.white)
            }
        }
    }
}

private struct FocusLiveActivityExpandedView: View {
    let state: LiveActivityAttributes.ContentState

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 32, style: .continuous)
                .fill(Color.black.opacity(0.9))
                .background(
                    RoundedRectangle(cornerRadius: 32, style: .continuous)
                        .fill(.ultraThinMaterial)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 32, style: .continuous)
                        .stroke(Color.white.opacity(0.18), lineWidth: 1)
                )

            VStack(alignment: .leading, spacing: 20) {
                header
                progressSection
                timerSection
                footer
            }
            .padding(.vertical, 26)
            .padding(.horizontal, 28)
        }
        .padding(.horizontal, 12)
    }

    private var header: some View {
        HStack {
            Text("LEORA")
                .font(.caption.weight(.semibold))
                .kerning(1.6)
                .foregroundStyle(Color.white.opacity(0.75))

            Spacer()

            HStack(spacing: 14) {
                Image(systemName: "arrow.up.right.square")
                Image(systemName: "flag.checkered")
            }
            .font(.caption2.weight(.semibold))
            .foregroundStyle(Color.white.opacity(0.55))
        }
    }

    private var progressSection: some View {
        let parsed = FocusSubtitleParser.parse(state.subtitle)
        let progressRatio: Double? = {
            if let explicit = state.progress {
                return min(max(explicit, 0), 1)
            }
            guard let total = parsed.totalSeconds, total > 0 else { return nil }
            let remaining = min(max(parsed.remainingSeconds ?? total, 0), total)
            let ratio = 1 - Double(remaining) / Double(total)
            return min(max(ratio, 0), 1)
        }()
        let elapsed = parsed.elapsedSeconds ?? 0

        return VStack(spacing: 10) {
            if let interval = FocusTimeFormatter.timerInterval(from: state) {
                ProgressView(timerInterval: interval)
                    .tint(Color.white)
            } else if let progressRatio {
                ProgressView(value: progressRatio)
                    .tint(Color.white)
            }

            HStack {
                Text(FocusTimeFormatter.formatted(seconds: elapsed))
                Spacer()
                Text(FocusTimeFormatter.totalText(from: state))
            }
            .font(.caption2)
            .foregroundStyle(Color.white.opacity(0.55))
        }
    }

    private var timerSection: some View {
        let parsed = FocusSubtitleParser.parse(state.subtitle)

        return VStack(alignment: .leading, spacing: 14) {
            Text(parsed.status)
                .font(.caption.weight(.medium))
                .foregroundStyle(Color.white.opacity(0.68))

            Text(state.title)
                .font(.caption.weight(.medium))
                .foregroundStyle(Color.white.opacity(0.72))
                .lineLimit(2)

            Text(FocusTimeFormatter.elapsedText(from: state))
                .font(.system(size: 48, weight: .bold, design: .rounded))
                .monospacedDigit()
                .foregroundStyle(Color.white)
                .minimumScaleFactor(0.6)
        }
    }

    private var footer: some View {
        let parsed = FocusSubtitleParser.parse(state.subtitle)
        let primaryLine = parsed.sessionLabel ?? parsed.remainingLabel

        var secondarySegments: [String] = []
        if let remaining = parsed.remainingLabel, remaining != primaryLine {
            secondarySegments.append(remaining)
        }
        if let breakLabel = parsed.breakLabel {
            secondarySegments.append(breakLabel)
        }
        if let total = parsed.totalLabel {
            secondarySegments.append(total)
        }
        let secondaryLine = secondarySegments.joined(separator: " • ")

        return HStack(alignment: .center, spacing: 20) {
            VStack(alignment: .leading, spacing: 6) {
                if let primary = primaryLine {
                    Text(primary)
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(Color.white.opacity(0.75))
                }
                if !secondaryLine.isEmpty {
                    Text(secondaryLine)
                        .font(.caption2)
                        .foregroundStyle(Color.white.opacity(0.6))
                }
                if parsed.isMuted {
                    Text("Muted")
                        .font(.caption2)
                        .foregroundStyle(Color.white.opacity(0.45))
                }
            }
            Spacer()

            HStack(spacing: 24) {
                FocusControlIcon(symbol: "gearshape.fill")
                FocusControlIcon(symbol: parsed.isRunning ? "pause.fill" : "play.fill")
                FocusControlIcon(symbol: "stop.fill")
            }
        }
    }
}

private struct FocusDynamicIslandExpanded: View {
    let state: LiveActivityAttributes.ContentState
    let tint: Color

    var body: some View {
        let parsed = FocusSubtitleParser.parse(state.subtitle)
        let progressRatio: Double = {
            if let explicit = state.progress {
                return min(max(explicit, 0), 1)
            }
            guard let total = parsed.totalSeconds, total > 0 else { return 0 }
            let remaining = min(max(parsed.remainingSeconds ?? total, 0), total)
            let ratio = 1 - Double(remaining) / Double(total)
            return min(max(ratio, 0), 1)
        }()
        let elapsed = parsed.elapsedSeconds ?? 0

        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("LEORA")
                    .font(.caption2.weight(.semibold))
                    .kerning(1.1)
                    .foregroundStyle(Color.white.opacity(0.7))
                Spacer()
                Text(state.title)
                    .font(.caption2)
                    .foregroundStyle(Color.white.opacity(0.55))
                    .lineLimit(1)
            }

            if let session = parsed.sessionLabel {
                Text(session)
                    .font(.caption2)
                    .foregroundStyle(Color.white.opacity(0.5))
            }

            Text(FocusTimeFormatter.elapsedText(from: state))
                .font(.system(size: 30, weight: .semibold, design: .rounded))
                .monospacedDigit()
                .foregroundStyle(Color.white)

            ProgressBar(progress: progressRatio, tint: tint)
                .frame(height: 10)

            HStack {
                Text(FocusTimeFormatter.formatted(seconds: elapsed))
                Spacer()
                Text(FocusTimeFormatter.totalText(from: state))
            }
            .font(.caption2)
            .foregroundStyle(Color.white.opacity(0.55))
        }
        .padding(.vertical, 16)
        .padding(.horizontal, 18)
        .background(
            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .fill(Color.black.opacity(0.9))
                .overlay(
                    RoundedRectangle(cornerRadius: 30, style: .continuous)
                        .stroke(Color.white.opacity(0.16), lineWidth: 1)
                )
        )
    }
}

private struct FocusControlIcon: View {
    let symbol: String

    var body: some View {
        Image(systemName: symbol)
            .font(.system(size: 18, weight: .semibold))
            .foregroundStyle(Color.white)
            .frame(width: 44, height: 44)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(Color.white.opacity(0.25), lineWidth: 1)
                    .background(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .fill(Color.white.opacity(0.08))
                    )
            )
    }
}

private struct ProgressBar: View {
    var progress: Double
    var tint: Color
    var track: Color = Color.white.opacity(0.2)

    private var clamped: Double {
        min(max(progress, 0), 1)
    }

    var body: some View {
        GeometryReader { geometry in
            let width = geometry.size.width
            let filledWidth = width * clamped
            Capsule()
                .fill(track)
                .overlay(
                    Capsule()
                        .fill(tint)
                        .frame(width: filledWidth)
                )
        }
    }
}

private enum FocusTimeFormatter {
    static func timerInterval(from state: LiveActivityAttributes.ContentState) -> ClosedRange<Date>? {
        guard let milliseconds = state.timerEndDateInMilliseconds else { return nil }
        let endDate = Date(timeIntervalSince1970: milliseconds / 1000)
        return Date()...endDate
    }

    static func elapsedText(from state: LiveActivityAttributes.ContentState) -> String {
        if let interval = timerInterval(from: state) {
            let seconds = max(Int(interval.upperBound.timeIntervalSinceNow.rounded()), 0)
            return format(seconds: seconds)
        }
        let parsed = FocusSubtitleParser.parse(state.subtitle)
        if let remaining = parsed.remainingSeconds {
            return format(seconds: remaining)
        }
        if let progress = state.progress {
            return String(format: "%02d%%", Int(progress * 100))
        }
        return "--:--"
    }

    static func totalText(from state: LiveActivityAttributes.ContentState) -> String {
        let parsed = FocusSubtitleParser.parse(state.subtitle)
        if let total = parsed.totalSeconds {
            return format(seconds: total)
        }
        if let interval = timerInterval(from: state) {
            let seconds = max(Int(interval.upperBound.timeIntervalSinceNow.rounded()), 0)
            return format(seconds: seconds)
        }
        return "60:00"
    }

    static func formatted(seconds: Int) -> String {
        format(seconds: seconds)
    }

    private static func format(seconds: Int) -> String {
        let clamped = max(seconds, 0)
        let minutes = (clamped / 60) % 60
        let remaining = clamped % 60
        let hours = clamped / 3600
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, remaining)
        }
        return String(format: "%02d:%02d", minutes, remaining)
    }
}

private enum FocusSubtitleParser {
    struct ParsedSubtitle {
        let status: String
        let remainingLabel: String?
        let sessionLabel: String?
        let totalLabel: String?
        let breakLabel: String?
        let isMuted: Bool
        let isRunning: Bool

        var remainingSeconds: Int? {
            FocusSubtitleParser.seconds(from: remainingLabel)
        }

        var totalSeconds: Int? {
            FocusSubtitleParser.seconds(from: totalLabel)
        }

        var elapsedSeconds: Int? {
            guard let total = totalSeconds, let remaining = remainingSeconds else { return nil }
            return max(total - remaining, 0)
        }
    }

    static func parse(_ subtitle: String?) -> ParsedSubtitle {
        guard let subtitle else {
            return .init(
                status: "In progress",
                remainingLabel: nil,
                sessionLabel: nil,
                totalLabel: nil,
                breakLabel: nil,
                isMuted: false,
                isRunning: true
            )
        }

        let segments = subtitle
            .split(separator: "•")
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }

        guard !segments.isEmpty else {
            return .init(
                status: "In progress",
                remainingLabel: nil,
                sessionLabel: nil,
                totalLabel: nil,
                breakLabel: nil,
                isMuted: false,
                isRunning: true
            )
        }

        let status = segments.first ?? "In progress"
        var remaining: String?
        var session: String?
        var total: String?
        var breakInfo: String?
        var muted = false

        for segment in segments.dropFirst() {
            let lowercased = segment.lowercased()

            if lowercased.contains("muted") {
                muted = true
                continue
            }

            if lowercased.contains("left") {
                if remaining == nil {
                    remaining = segment
                }
                continue
            }

            if lowercased.contains("session") {
                session = segment
                continue
            }

            if lowercased.contains("total") {
                total = segment
                continue
            }

            if lowercased.contains("break") {
                breakInfo = segment
                continue
            }

            if session == nil {
                session = segment
            } else if breakInfo == nil {
                breakInfo = segment
            } else if total == nil {
                total = segment
            }
        }

        let isRunning = !status.localizedCaseInsensitiveContains("paused") && !status.localizedCaseInsensitiveContains("stopped")

        return .init(
            status: status,
            remainingLabel: remaining,
            sessionLabel: session,
            totalLabel: total,
            breakLabel: breakInfo,
            isMuted: muted,
            isRunning: isRunning
        )
    }

    private static func seconds(from label: String?) -> Int? {
        guard let label else { return nil }
        guard let timeComponent = label.split(separator: " ").first(where: { $0.contains(":") }) else {
            return nil
        }

        let parts = timeComponent.split(separator: ":").compactMap { Int($0) }
        guard !parts.isEmpty else { return nil }

        if parts.count == 1 {
            return parts[0]
        }
        if parts.count == 2 {
            return parts[0] * 60 + parts[1]
        }
        if parts.count == 3 {
            return parts[0] * 3600 + parts[1] * 60 + parts[2]
        }

        return nil
    }
}
