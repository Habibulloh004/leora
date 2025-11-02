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

private extension Color {
    static func fromHex(_ hex: String?) -> Color? {
        guard var hex = hex?.trimmingCharacters(in: .whitespacesAndNewlines), !hex.isEmpty else { return nil }
        if hex.hasPrefix("#") {
            hex.removeFirst()
        }
        if hex.count == 6 {
            hex.append("FF")
        }
        guard hex.count == 8, let value = UInt64(hex, radix: 16) else { return nil }
        let red = Double((value >> 24) & 0xFF) / 255
        let green = Double((value >> 16) & 0xFF) / 255
        let blue = Double((value >> 8) & 0xFF) / 255
        let alpha = Double(value & 0xFF) / 255
        return Color(.sRGB, red: red, green: green, blue: blue, opacity: alpha)
    }
}

private struct FocusColorPalette {
    let background: Color
    let title: Color
    let subtitle: Color
    let accent: Color
    let track: Color
    let chrome: Color
    let badge: Color

    init(attributes: LiveActivityAttributes) {
        background = Color.fromHex(attributes.backgroundColor) ?? Color.black.opacity(0.92)
        title = Color.fromHex(attributes.titleColor) ?? .white
        subtitle = Color.fromHex(attributes.subtitleColor) ?? Color.white.opacity(0.68)
        let accentBase = Color.fromHex(attributes.progressViewTint) ?? .white
        accent = accentBase
        track = accentBase.opacity(0.25)
        chrome = Color.white.opacity(0.22)
        badge = Color.white.opacity(0.12)
    }
}

struct FocusLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: LiveActivityAttributes.self) { context in
            let palette = FocusColorPalette(attributes: context.attributes)
            FocusLiveActivityExpandedView(state: context.state, palette: palette)
                .activityBackgroundTint(palette.background)
                .activitySystemActionForegroundColor(palette.title)
        } dynamicIsland: { context in
            let palette = FocusColorPalette(attributes: context.attributes)

            return DynamicIsland {
                FocusDynamicIslandExpandedRegions(state: context.state, palette: palette)
            } compactLeading: {
                FocusCompactTimerLabel(state: context.state, palette: palette)
            } compactTrailing: {
                FocusTimerGlyph(size: 18, palette: palette)
            } minimal: {
                FocusMinimalTimer(state: context.state, palette: palette)
            }
        }
    }
}

private struct FocusLiveActivityExpandedView: View {
    let state: LiveActivityAttributes.ContentState
    let palette: FocusColorPalette

    var body: some View {
        TimelineView(.animation(minimumInterval: 0.5)) { timeline in
            let snapshot = FocusTimerAnalyzer.snapshot(for: state, at: timeline.date)
            FocusExpandedContent(snapshot: snapshot, palette: palette)
        }
    }
}

private struct FocusExpandedContent: View {
    let snapshot: FocusTimerSnapshot
    let palette: FocusColorPalette

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .fill(palette.background)
                .overlay(
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .stroke(palette.chrome, lineWidth: 1)
                )

            VStack(spacing: 24) {
                headerRow
                progressBlock
                timerBlock
                controlsRow
            }
            .padding(.vertical, 28)
            .padding(.horizontal, 28)
        }
        .padding(.horizontal, 12)
    }

    private var headerRow: some View {
        HStack {
            Text("LEORA")
                .font(.caption.weight(.semibold))
                .kerning(1.2)
                .foregroundStyle(palette.title.opacity(0.9))

            Spacer()

            FocusLinkButton(palette: palette)
        }
    }

    private var progressBlock: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(FocusStatusFormatter.display(from: snapshot).uppercased())
                .font(.caption2.weight(.semibold))
                .foregroundStyle(palette.subtitle.opacity(0.85))
                .lineLimit(1)

            FocusLinearProgressBar(progress: snapshot.progress, palette: palette)
                .frame(height: 10)

            HStack {
                Text("Elapsed \(FocusTimeFormatter.formattedElapsed(snapshot: snapshot, fallback: "--"))")
                Spacer()
                Text("Total \(FocusTimeFormatter.formattedTotal(snapshot: snapshot, fallback: "--"))")
            }
            .font(.caption2.weight(.medium))
            .foregroundStyle(palette.subtitle.opacity(0.7))
            .monospacedDigit()
        }
    }

    private var timerBlock: some View {
        Text(FocusTimeFormatter.formattedRemaining(snapshot: snapshot))
            .font(.system(size: 56, weight: .bold, design: .rounded))
            .monospacedDigit()
            .foregroundStyle(palette.title)
            .frame(maxWidth: .infinity, alignment: .center)
    }

    private var controlsRow: some View {
        HStack(spacing: 20) {
            FocusControlIcon(symbol: "gearshape.fill", palette: palette)
            FocusControlIcon(
                symbol: snapshot.isRunning ? "pause.fill" : "play.fill",
                palette: palette,
                isEmphasized: true
            )
            FocusControlIcon(symbol: "stop.fill", palette: palette)
        }
        .frame(maxWidth: .infinity, alignment: .center)
    }
}

@DynamicIslandExpandedContentBuilder
private func FocusDynamicIslandExpandedRegions(
    state: LiveActivityAttributes.ContentState,
    palette: FocusColorPalette
) -> DynamicIslandExpandedContent<some View> {
    DynamicIslandExpandedRegion(.center, priority: 1) {
        FocusDynamicIslandTimeline(state: state) { snapshot in
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text("LEORA")
                        .font(.caption2.weight(.semibold))
                        .kerning(1.0)
                        .foregroundStyle(palette.title.opacity(0.9))

                    Spacer()

                    FocusLinkButton(palette: palette)
                        .frame(width: 26, height: 26)
                }

                Text(FocusStatusFormatter.display(from: snapshot).uppercased())
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(palette.subtitle.opacity(0.8))
                    .lineLimit(1)

                FocusLinearProgressBar(progress: snapshot.progress, palette: palette)
                    .frame(height: 6)

                Text(FocusTimeFormatter.formattedRemaining(snapshot: snapshot))
                    .font(.system(size: 32, weight: .semibold, design: .rounded))
                    .monospacedDigit()
                    .foregroundStyle(palette.title)
                    .frame(maxWidth: .infinity, alignment: .center)
            }
        }
    }

    DynamicIslandExpandedRegion(.bottom) {
        FocusDynamicIslandTimeline(state: state) { snapshot in
            HStack(alignment: .center) {
                FocusControlIcon(symbol: "gearshape.fill", palette: palette)
                Spacer(minLength: 24)
                FocusControlIcon(
                    symbol: snapshot.isRunning ? "pause.fill" : "play.fill",
                    palette: palette,
                    isEmphasized: true
                )
                Spacer(minLength: 24)
                FocusControlIcon(symbol: "stop.fill", palette: palette)
            }
        }
    }
}

private struct FocusDynamicIslandTimeline<Content: View>: View {
    let state: LiveActivityAttributes.ContentState
    let content: (FocusTimerSnapshot) -> Content

    var body: some View {
        TimelineView(.animation(minimumInterval: 0.5)) { timeline in
            let snapshot = FocusTimerAnalyzer.snapshot(for: state, at: timeline.date)
            content(snapshot)
        }
    }
}

private struct FocusCompactTimerLabel: View {
    let state: LiveActivityAttributes.ContentState
    let palette: FocusColorPalette

    var body: some View {
        TimelineView(.animation(minimumInterval: 1)) { timeline in
            let snapshot = FocusTimerAnalyzer.snapshot(for: state, at: timeline.date)
            Text(FocusTimeFormatter.formattedRemaining(snapshot: snapshot, fallback: "--"))
                .font(.system(size: 14, weight: .semibold, design: .rounded))
                .monospacedDigit()
                .foregroundStyle(palette.title)
        }
    }
}

private struct FocusMinimalTimer: View {
    let state: LiveActivityAttributes.ContentState
    let palette: FocusColorPalette

    var body: some View {
        TimelineView(.animation(minimumInterval: 1.0 / 8.0)) { timeline in
            let snapshot = FocusTimerAnalyzer.snapshot(for: state, at: timeline.date)
            VStack(spacing: 6) {
                FocusTimerGlyph(size: 16, palette: palette)
                FocusLinearProgressBar(progress: snapshot.progress, palette: palette)
                    .frame(width: 34, height: 4)
            }
            .padding(.vertical, 4)
            .padding(.horizontal, 4)
        }
    }
}

private struct FocusTimerGlyph: View {
    var size: CGFloat
    var palette: FocusColorPalette

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: size, style: .continuous)
                .fill(palette.badge)
            RoundedRectangle(cornerRadius: size, style: .continuous)
                .stroke(palette.chrome, lineWidth: 1)
            Image(systemName: "timer")
                .font(.system(size: size * 0.72, weight: .semibold))
                .foregroundStyle(palette.accent)
        }
        .frame(width: size * 1.8, height: size * 1.8)
    }
}

private struct FocusControlIcon: View {
    let symbol: String
    let palette: FocusColorPalette
    var isEmphasized: Bool = false

    var body: some View {
        Image(systemName: symbol)
            .font(.system(size: 18, weight: .semibold))
            .foregroundStyle(isEmphasized ? Color.black.opacity(0.85) : palette.title)
            .frame(width: 46, height: 46)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(isEmphasized ? palette.accent : palette.badge)
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(isEmphasized ? palette.accent.opacity(0.7) : palette.chrome, lineWidth: 1)
                    )
            )
    }
}

private struct FocusLinkButton: View {
    let palette: FocusColorPalette

    var body: some View {
        Image(systemName: "arrow.up.right")
            .font(.system(size: 12, weight: .semibold))
            .foregroundStyle(palette.title.opacity(0.85))
            .frame(width: 28, height: 28)
            .background(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(palette.badge)
                    .overlay(
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .stroke(palette.chrome, lineWidth: 1)
                    )
            )
    }
}

private struct FocusLinearProgressBar: View {
    let progress: Double
    let palette: FocusColorPalette

    var body: some View {
        GeometryReader { geometry in
            let clamped = CGFloat(min(max(progress, 0), 1))
            let width = geometry.size.width
            let filled = width * clamped

            ZStack(alignment: .leading) {
                Capsule(style: .continuous)
                    .fill(palette.track)
                Capsule(style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [
                                palette.accent.opacity(0.9),
                                palette.accent
                            ],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(width: max(filled, clamped > 0 ? 3 : 0))
            }
            .animation(.easeOut(duration: 0.25), value: progress)
        }
    }
}

private struct FocusTimerSnapshot {
    let date: Date
    let progress: Double
    let elapsedSeconds: Int?
    let remainingSeconds: Int?
    let totalSeconds: Int?
    let endDate: Date?
    let subtitle: FocusSubtitleParser.ParsedSubtitle

    var isRunning: Bool {
        subtitle.isRunning && (remainingSeconds ?? 0) > 0
    }
}

private enum FocusTimerAnalyzer {
    static func snapshot(for state: LiveActivityAttributes.ContentState, at date: Date) -> FocusTimerSnapshot {
        let subtitle = FocusSubtitleParser.parse(state.subtitle)
        let rawEndDate = state.timerEndDateInMilliseconds.map { Date(timeIntervalSince1970: $0 / 1000) }
        let isRunning = subtitle.isRunning

        var remaining: Int? = nil
        if isRunning, let rawEndDate {
            remaining = max(Int(rawEndDate.timeIntervalSince(date)), 0)
        }

        if remaining == nil, let explicit = subtitle.remainingSeconds {
            remaining = max(explicit, 0)
        }

        if remaining == nil, let rawEndDate {
            remaining = max(Int(rawEndDate.timeIntervalSince(date)), 0)
        }

        let total = subtitle.totalSeconds

        var elapsed: Int? = nil
        if let total, let remaining {
            elapsed = max(total - remaining, 0)
        } else if let explicitElapsed = subtitle.elapsedSeconds {
            elapsed = max(explicitElapsed, 0)
        }

        if elapsed == nil, let total, let progress = state.progress {
            elapsed = max(Int(round(progress * Double(total))), 0)
        }

        var progressValue: Double
        if let total, let remaining, total > 0 {
            progressValue = 1 - Double(remaining) / Double(total)
        } else if let progress = state.progress {
            progressValue = progress
        } else {
            progressValue = 0
        }

        if !isRunning, let progress = state.progress {
            progressValue = progress
        }

        progressValue = min(max(progressValue, 0), 1)

        let endDate = isRunning ? rawEndDate : nil

        return FocusTimerSnapshot(
            date: date,
            progress: progressValue,
            elapsedSeconds: elapsed,
            remainingSeconds: remaining,
            totalSeconds: total,
            endDate: endDate,
            subtitle: subtitle
        )
    }
}

private enum FocusTimeFormatter {
    static func formattedRemaining(snapshot: FocusTimerSnapshot, fallback: String = "--:--") -> String {
        guard let seconds = snapshot.remainingSeconds else { return fallback }
        return format(seconds: seconds)
    }

    static func formattedElapsed(snapshot: FocusTimerSnapshot, fallback: String = "--:--") -> String {
        guard let seconds = snapshot.elapsedSeconds else { return fallback }
        return format(seconds: seconds)
    }

    static func formattedTotal(snapshot: FocusTimerSnapshot, fallback: String = "--:--") -> String {
        if let total = snapshot.totalSeconds {
            return format(seconds: total)
        }
        return fallback
    }

    static func format(seconds: Int) -> String {
        let clamped = max(seconds, 0)
        let hours = clamped / 3600
        let minutes = (clamped / 60) % 60
        let remaining = clamped % 60
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, remaining)
        }
        return String(format: "%02d:%02d", minutes, remaining)
    }
}

private enum FocusStatusFormatter {
    static func display(from snapshot: FocusTimerSnapshot) -> String {
        let raw = snapshot.subtitle.status.trimmingCharacters(in: .whitespacesAndNewlines)
        if raw.isEmpty {
            return snapshot.isRunning ? "In progress" : "Paused"
        }
        return raw
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
